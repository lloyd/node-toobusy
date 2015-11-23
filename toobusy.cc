#include <v8.h>
#include <nan.h>
#include <node.h>
#include <uv.h>
#include <stdlib.h>
#if defined(_WIN32)
  #include <time.h>
#else
  #include <sys/time.h>
#endif

using namespace v8;

static const unsigned int POLL_PERIOD_MS = 500;
static unsigned int HIGH_WATER_MARK_MS = 70;
// A dampening factor.  When determining average calls per second or
// current lag, we weigh the current value against the previous value 2:1
// to smooth spikes.
static const unsigned int AVG_DECAY_FACTOR = 3;

//static uv_idle_t s_idler;
static uv_timer_t s_timer;
static uint32_t s_currentLag;
static uint64_t s_lastMark;

NAN_METHOD(TooBusy) {
    Nan::HandleScope scope;
    // No HandleScope required, because this function allocates no
    // v8 classes that reside on the heap.
    bool block = false;
    if (s_currentLag > HIGH_WATER_MARK_MS) {
        // probabilistically block requests proportional to how
        // far behind we are.
        double pctToBlock = ((s_currentLag - HIGH_WATER_MARK_MS) /
                             (double) HIGH_WATER_MARK_MS) * 100.0;
        double r = (rand() / (double) RAND_MAX) * 100.0;
        if (r < pctToBlock) block = true;
    }
    info.GetReturnValue().Set(Nan::New(block));
}

NAN_METHOD(ShutDown) {
    // No HandleScope required, because this function allocates no
    // v8 classes that reside on the heap.

    uv_timer_stop(&s_timer);
}

NAN_METHOD(Lag) {
    Nan::HandleScope scope;
    info.GetReturnValue().Set(Nan::New(s_currentLag));
}

NAN_METHOD(HighWaterMark) {
    Nan::HandleScope scope;
    if (info.Length() >= 1) {
        if (!info[0]->IsNumber()) {
            Nan::ThrowError("expected numeric first argument");
            return;
        }
        int hwm = info[0]->Int32Value();
        if (hwm < 10) {
            Nan::ThrowError("maximum lag should be greater than 10ms");
            return;
        }
        HIGH_WATER_MARK_MS = hwm;
    }

    info.GetReturnValue().Set(Nan::New(HIGH_WATER_MARK_MS));
}

static void every_second(uv_timer_t* handle)
{
    uint64_t now = uv_hrtime();

    if (s_lastMark > 0) {
        // keep track of (dampened) average lag.
        uint32_t lag = (uint32_t) ((now - s_lastMark) / 1000000);
        lag = (lag < POLL_PERIOD_MS) ? 0 : lag - POLL_PERIOD_MS;
        s_currentLag = (lag + (s_currentLag * (AVG_DECAY_FACTOR-1))) /
            AVG_DECAY_FACTOR;
    }
    s_lastMark = now;
};

__attribute__((unused)) static void every_second(uv_timer_t* handle, int) {
    every_second(handle);
}

extern "C" NAN_MODULE_INIT(init) {
    Nan::HandleScope scope;

    Nan::SetMethod(target, "toobusy", TooBusy);
    Nan::SetMethod(target, "shutdown", ShutDown);
    Nan::SetMethod(target, "lag", Lag);
    Nan::SetMethod(target, "maxLag", HighWaterMark);

    uv_timer_init(uv_default_loop(), &s_timer);
    uv_timer_start(&s_timer, every_second, POLL_PERIOD_MS, POLL_PERIOD_MS);
};

NODE_MODULE(toobusy, init);
