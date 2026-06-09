# Tampermonkey Hide Images

This is a tampermonkey script for web page to hide images by **alt + z**.  
It is written by Google Gmini, see https://gemini.google.com/share/9330c01d9cef

## Mode
```javascript
const MODES = {
    NORMAL: 0, // show images（default）
    HIDDEN: 1, // visibility: 'hidden' (hide images)
};
```

## keyboard shortcuts
Default is **alt + z**, you can change it by yourself.
```javascript
const DEFAULT_CONFIG = {
    key: 'z',
    alt: true,
    ctrl: false,
    shift: false
};
```

## Install 
see https://www.tampermonkey.net/index.php
