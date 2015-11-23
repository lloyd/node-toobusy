{
  'targets': [
    {
      'target_name': 'toobusy',
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
      ],
      'sources': [
        'toobusy.cc',
      ]
    }
  ]
}
