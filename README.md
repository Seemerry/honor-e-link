# Honor E Link

一个可安装、可离线打开的 iPhone PWA。直接进入“我的团队”，默认显示“我加入的”。

在线地址：https://seemerry.github.io/honor-e-link/

## 在 iPhone 上安装

1. 用 Safari 打开在线地址，保持联网等待首次页面加载完成。
2. 点“分享”→“添加到主屏幕”。如有“作为网页 App 打开”，保持开启。
3. 名称为 **Honor E Link**，点“添加”。
4. 从主屏幕图标打开一次；之后可以开飞行模式重新打开，确认离线缓存。

从主屏幕打开是独立窗口，没有 Safari 地址栏。系统仍会显示真实时间、电量和底部手势条。

## 实现

- 页面全部使用真实 HTML/CSS 和少量 SVG 图形；没有使用截图或整页背景图片。
- 参考图以 920px 为基准换算尺寸，移动端按实际 CSS 视口缩放。iPhone 18 Pro 以 402×874 CSS px 为排版目标，图形使用 SVG，主屏幕图标提供高清 PNG。刘海、灵动岛、横屏和底部手势区域使用 `env(safe-area-inset-*)` 适配。
- 原图中的 Android 通知、4G、电量数值和底部导航不伪造；使用 iPhone 自身状态栏。字体采用本机中文系统字体，与 Android 字形会有细微差异。
- 可以点击双标签或在内容区域左右滑动切换；“我管理的”页面为空，“我加入的”显示原有公司条目。
- 搜索按钮打开团队搜索，输入文字即时过滤现有团队；点击结果回到“我加入的”。返回按钮、浏览器返回和 Escape 均可退出搜索。
- 加人按钮按用户要求仅打开仿原版“添加好友”页面，账号输入框可编辑，不保存联系人、不发送好友申请，也不连接真实荣耀服务。
- 图标为手绘 SVG 曲线，导出 180 / 192 / 512 / 1024px PNG。PNG 是完整正方形，不预裁 iOS 圆角。
- 没有外部字体、第三方脚本、登录、统计或服务端依赖。
- `manifest.webmanifest` 和 service worker 都使用相对路径，支持 GitHub Pages 仓库子路径。

## 本地预览

在此目录运行 `python -m http.server 8080`，访问 `http://localhost:8080/`。无需构建或安装依赖。

## 更新与发布

GitHub Pages 从 `main` 分支根目录发布。修改静态文件后提交即可。修改页面资源时同步提升 `sw.js` 的 `CACHE_NAME` 版本和 HTML 中 CSS/JS 的版本参数，并更新缓存清单，使已安装的旧版本能取得新资源。

`assets/icon.svg` 是可编辑图标源文件；`tools/render-icons.cjs` 用 sharp 重新生成图标，先安装开发依赖 `npm install --no-save sharp`，然后执行 `node tools/render-icons.cjs`。

## 已知边界

浏览器模拟可以检查布局、manifest 和离线重载；Safari 主屏幕安装、系统安全区和视觉最终效果仍需要在实际 iPhone 上确认。首次打开必须联网，iOS 清理网站数据后需要联网重新缓存。

安装说明依据 Apple 官方文档：https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios

设备屏幕规格：https://www.apple.com/iphone-18-pro/specs/
