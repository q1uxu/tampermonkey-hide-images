# Tampermonkey Hide Images and Videos

This is a tampermonkey script for web page to hide images and videos by **ctrl + alt + shift + z**.  
It is written by Google Gmini, see https://gemini.google.com/share/9330c01d9cef

## Mode
```javascript
const MODES = {
    NORMAL: 0, // show images/videos（default）
    HIDDEN: 1, // visibility: 'hidden' (hide images/videos)
};
```

## keyboard shortcuts
Default is **ctrl + alt + shift + z**, you can change it by yourself.
```javascript
const DEFAULT_CONFIG = {
    key: "z",
    alt: true,
    ctrl: true,
    shift: true,
};
```

## Install 
see https://www.tampermonkey.net/index.php
