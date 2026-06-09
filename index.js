// ==UserScript==
// @name         网页图片隐藏工具 (精简双模式版)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  通过快捷键 Alt+Z 在“正常显示”和“隐藏占位(visibility:hidden)”之间快速切换。仅在非IP、非localhost的正式域名网页下生效。
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

    // 2. 排除 IPv4 和 IPv6 纯 IP 地址
    const ipPattern = /^(?:(?:\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\])$/;
    if (ipPattern.test(hostname)) {
        return;
    }
    // ================================================

    // ================= 配置区域 =================
    // 默认快捷键配置
    const DEFAULT_CONFIG = {
        key: "z",
        alt: true,
        ctrl: false,
        shift: false,
    };
    // ============================================

    // 仅保留 2 种模式
    const MODES = {
        NORMAL: 0, // 不对图片进行操作（默认）
        HIDDEN: 1, // visibility: 'hidden' (隐藏但占位)
    };

    const MODE_LABELS = {
        [MODES.NORMAL]: "恢复正常",
        [MODES.HIDDEN]: "已隐藏图片 (保留占位)",
    };

    // 使用 sessionStorage 实现单标签页隔离，默认为正常模式
    let currentMode = parseInt(
        sessionStorage.getItem("current_img_mode") || MODES.NORMAL,
        10,
    );

    // 应用样式的核心函数
    function applyStyleToImage(img) {
        // 备份原始样式（仅在第一次处理该图片时处理）
        if (img.dataset.origVisibility === undefined) {
            img.dataset.origVisibility = img.style.visibility || "";
        }

        if (currentMode === MODES.HIDDEN) {
            img.style.visibility = "hidden";
        } else {
            img.style.visibility = img.dataset.origVisibility;
        }
    }

    // 处理页面上的所有图片
    function processAllImages() {
        const imgs = document.querySelectorAll("img");
        imgs.forEach((img) => applyStyleToImage(img));
    }

    // 切换模式（在 0 和 1 之间来回切）
    function switchMode() {
        currentMode =
            currentMode === MODES.NORMAL ? MODES.HIDDEN : MODES.NORMAL;
        sessionStorage.setItem("current_img_mode", currentMode);

        showToast(`[当前标签] ${MODE_LABELS[currentMode]}`);
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
