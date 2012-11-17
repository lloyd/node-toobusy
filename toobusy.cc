#include <v8.h>
#include <node.h>
#include <uv.h>
#include <stdlib.h>
#include <sys/time.h>

using namespace v8;

static const unsigned int POLL_PERIOD_MS = 500;
static unsigned int HIGH_WATER_MARK_MS = 70;
static const unsigned int AVG_DECAY_FACTOR = 3;

//static uv_idle_t s_idler;
static uv_timer_t s_timer;
static uint64_t s_currentLag;
static uint64_t s_lastMark;
static uint64_t s_avgCalls;
static uint64_t s_calls;

Handle<Value> TooBusy(const Arguments& args) {
    bool block = false;
    if (s_currentLag > HIGH_WATER_MARK_MS) {
        // probabilistically block 2x as many requests as we would need
        // to in order to catch up.
        double pctToBlock = ((s_currentLag - HIGH_WATER_MARK_MS) /
                             (double) HIGH_WATER_MARK_MS) * 100.0;
        double r = (rand() / (double) RAND_MAX) * 100.0;
        if (r < pctToBlock) block = true;
    }
    s_calls++;
    return Boolean::New(block);
}

Handle<Value> ShutDown(const Arguments& args) {
    uv_timer_stop(&s_timer);
    return Undefined();
}

Handle<Value> HighWaterMark(const Arguments& args) {
    HandleScope scope;

    if (args.Length() >= 1) {
        if (!args[0]->IsNumber()) {
            return v8::ThrowException(
                v8::Exception::Error(
                    v8::String::New("expected numeric first argument")));
        }
        int hwm = args[0]->Int32Value();
        if (hwm < 10) {
            return v8::ThrowException(
                v8::Exception::Error(
                    v8::String::New("high water mark should be greater than 10ms")));
        }
        HIGH_WATER_MARK_MS = hwm;
    }

    return scope.Close(Number::New(HIGH_WATER_MARK_MS));
}

static void every_second(uv_timer_t* handle, int status)
{
    uint64_t now = uv_hrtime();

    s_avgCalls = (s_calls + (s_avgCalls * (AVG_DECAY_FACTOR-1))) /
        AVG_DECAY_FACTOR;
    s_calls = 0;

    if (s_lastMark > 0) {
        uint64_t lag = ((now - s_lastMark) / 1000000);
        lag = (lag < POLL_PERIOD_MS) ? 0 : lag - POLL_PERIOD_MS;
        s_currentLag = (lag + (s_currentLag * (AVG_DECAY_FACTOR-1))) /
            AVG_DECAY_FACTOR;
    }
    s_lastMark = now;
};

extern "C" void init(Handle<Object> target) {
    HandleScope scope;

    target->Set(String::New("toobusy"), FunctionTemplate::New(TooBusy)->GetFunction());
    target->Set(String::New("shutdown"), FunctionTemplate::New(ShutDown)->GetFunction());
    target->Set(String::New("maxLag"), FunctionTemplate::New(HighWaterMark)->GetFunction());
    uv_timer_init(uv_default_loop(), &s_timer);
    uv_timer_start(&s_timer, every_second, POLL_PERIOD_MS, POLL_PERIOD_MS);
};
