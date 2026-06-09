// ==UserScript==
// @name         网页图片隐藏与缩放工具 (纯域名限定版)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  通过快捷键切换图片的显示模式。仅在非IP、非localhost的正式域名网页下生效。
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    // ================= 域名过滤逻辑 =================
    const hostname = window.location.hostname;

    // 1. 排除 localhost
    if (hostname === "localhost") {
        return;
    }

    // 2. 排除 IPv4 和 IPv6 纯 IP 地址的正则表达式
    const ipPattern = /^(?:(?:\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\])$/;
    if (ipPattern.test(hostname)) {
        return; // 如果是纯 IP 地址，直接退出脚本，不执行后续逻辑
    }
    // ================================================

    // ================= 配置区域 =================
    // 默认快捷键配置：
    const DEFAULT_CONFIG = {
        key: "z",
        alt: true,
        ctrl: false,
        shift: false,
    };
    // ============================================

    // 4 种模式定义
    const MODES = {
        NORMAL: 0, // 不对图片进行操作（默认）
        HIDDEN: 1, // visibility: 'hidden' (隐藏但占位)
        NONE: 2, // display: 'none' (隐藏且不占位)
        SCALE: 3, // 图片缩小 50%
    };

    const MODE_LABELS = {
        [MODES.NORMAL]: "恢复正常",
        [MODES.HIDDEN]: "隐藏占位 (visibility: hidden)",
        [MODES.NONE]: "完全隐藏 (display: none)",
        [MODES.SCALE]: "缩小 50%",
    };

    // 使用 sessionStorage 实现单标签页隔离，默认为正常模式
    let currentMode = parseInt(
        sessionStorage.getItem("current_img_mode") || MODES.NORMAL,
        10,
    );

    // 应用样式的核心函数
    function applyStyleToImage(img) {
        if (img.dataset.origVisibility === undefined)
            img.dataset.origVisibility = img.style.visibility || "";
        if (img.dataset.origDisplay === undefined)
            img.dataset.origDisplay = img.style.display || "";
        if (img.dataset.origTransform === undefined)
            img.dataset.origTransform = img.style.transform || "";
        if (img.dataset.origTransformOrigin === undefined)
            img.dataset.origTransformOrigin = img.style.transformOrigin || "";

        switch (currentMode) {
            case MODES.NORMAL:
                img.style.visibility = img.dataset.origVisibility;
                img.style.display = img.dataset.origDisplay;
                img.style.transform = img.dataset.origTransform;
                img.style.transformOrigin = img.dataset.origTransformOrigin;
                break;
            case MODES.HIDDEN:
                img.style.visibility = "hidden";
                img.style.display = img.dataset.origDisplay;
                img.style.transform = img.dataset.origTransform;
                break;
            case MODES.NONE:
                img.style.display = "none";
                img.style.visibility = img.dataset.origVisibility;
                img.style.transform = img.dataset.origTransform;
                break;
            case MODES.SCALE:
                img.style.visibility = img.dataset.origVisibility;
                img.style.display = img.dataset.origDisplay;
                img.style.transform = "scale(0.5)";
                img.style.transformOrigin = "center center";
                break;
        }
    }

    // 处理页面上的所有图片
    function processAllImages() {
        const imgs = document.querySelectorAll("img");
        imgs.forEach((img) => applyStyleToImage(img));
    }

    // 切换到下一个模式
    function switchMode() {
        currentMode = (currentMode + 1) % 4;
        sessionStorage.setItem("current_img_mode", currentMode);

        showToast(`[当前标签] 图片模式已切换至: ${MODE_LABELS[currentMode]}`);
        processAllImages();
    }

    // 快捷键监听
    window.addEventListener(
        "keydown",
        function (e) {
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA" ||
                e.target.isContentEditable
            ) {
                return;
            }

            if (
                e.key.toLowerCase() === DEFAULT_CONFIG.key.toLowerCase() &&
                e.altKey === DEFAULT_CONFIG.alt &&
                e.ctrlKey === DEFAULT_CONFIG.ctrl &&
                e.shiftKey === DEFAULT_CONFIG.shift
            ) {
                e.preventDefault();
                switchMode();
            }
        },
        true,
    );

    // 监听动态生成的图片
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === "IMG") {
                    applyStyleToImage(node);
                } else if (node.querySelectorAll) {
                    const imgs = node.querySelectorAll("img");
                    imgs.forEach((img) => applyStyleToImage(img));
                }
            });
        });
    });

    // 页面加载完成后启动
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            processAllImages();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        processAllImages();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 提示框组件
    function showToast(text) {
        let toast = document.getElementById("tm-img-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "tm-img-toast";
            toast.style.cssText =
                "position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:4px;z-index:999999;font-size:14px;pointer-events:none;transition:opacity 0.3s;";
            document.body.appendChild(toast);
        }
        toast.innerText = text;
        toast.style.opacity = "1";
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => {
            toast.style.opacity = "0";
        }, 2000);
    }
})();
