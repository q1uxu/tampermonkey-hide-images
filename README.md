# Tampermonkey Hide Images

This is a tampermonkey script for web page to hide images by **alt + z**.

## Mode
```javascript
const MODES = {
    NORMAL: 0, // 不对图片进行操作（默认）
    HIDDEN: 1, // visibility: 'hidden' (隐藏但占位)
    NONE: 2, // display: 'none' (隐藏且不占位)
    SCALE: 3, // 图片缩小 50%
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
