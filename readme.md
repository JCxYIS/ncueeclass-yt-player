# ncueeclass-yt-player
> Operating System (CE3002A) - Program 2: Using Thread

<!-- [TOC] -->

## 開發環境
- Ubuntu 20.04.2 LTS
- python 3.8
    - used package list in `requirements.txt`
- Chrome 90.0
    - TamperMonkey 4.12

## 運作方式
搭配 另一個專案 [Youtube-Frames-to-Array](https://github.com/JCxYIS/Youtube-Frames-to-Array) 使用

- 瀏覽器(Tampermonkey)加入腳本`eeclass_yt_player.js` 
- 運行 另一個專案的 `runtestserver.py`
<!-- - 進入 http://localhost:8763  -->
- 瀏覽 eeclass 的「我的課表」，填入要播放的 youtube 影片網址
    - https://ncueeclass.ncu.edu.tw/dashboard/myTimeTable

## 功能
- DEMO 影片 (V.1)
<!-- {%youtube 5Bkfc6cfgXg %} -->
[![yt](https://img.youtube.com/vi/5Bkfc6cfgXg/0.jpg)](https://youtu.be/5Bkfc6cfgXg)
<!-- https://youtu.be/5Bkfc6cfgXg -->
(後來額外加了可以播放任意 youtube 影片的功能)
![](https://i.imgur.com/BplrYBv.png)


## 程式與功能說明
### `runserver.py` (API)
會在 8763 port 開啟一個服務。有以下的 route：
- `refresh/`: 需要用 POST 存取，並提供一個 youtube 影片的網址(`url`)。會呼叫 `preprocess`來處理這支影片，並在完成時丟回一個回應
- `output/`: 會回傳把處理好的 json 檔
- `audio/`: 會回傳下載好的音檔 (沒有副標題，但對於瀏覽器沒差)

---

### `preprocess.py` (core)
處理影片的主要程式，有以下幾個設定參數
- `URL`： Youtube 影片網址
- `OUTPUT_MAX_WIDTH`：輸出寬度最多為幾格
- `OUTPUT_MAX_HEIGHT`：輸出高度最多為幾格
- `OUTPUT_COLOR_COUNT`：要分成幾種色彩？ 如：2 代表就只有 0 跟 1 兩種顏色
- `FRAME_DATA_PATH`、`AUDIO_PATH` 一些路徑設定

#### `main(setting: PreprocessingSetting)`
程式的進入點為 `main()`，在進入後會獲得影片的真實網址 (位於`https://*.googlevideo.com/`)，之後我們會開個 Thread 分開處理聲音與影像。

#### `download_audio(pafyObj)`
利用 pafy 套件從 youtube 下載音樂檔。

#### `process_video(setting: PreprocessingSetting, raw_video_url: str)`
利用 opencv 處理影片檔
一開始先獲取影片資訊，決定是否要執行壓縮。
接下來我們會遞迴處理每一幀，讀取每一個 pixel 後依照他的灰度 (公式：$0.2989 * R + 0.5870 * G + 0.1140 * B$) 給他一個相應的值。
最後再把結果連同一些參數輸出成 json 格式。

---

### `eeclass_yt_player.js` (瀏覽器腳本 / GUI)
因為 ee-class 的課表有 7 * 10 格可用，因此我們先把這些空間設法塞到一個二維陣列裡，
接下來把功能列 (網址輸入、按鈕) 創建好，就進入撰寫的功能了

#### `OnPlayButtonClicked()`
顧名思義就是處理 Play 按鈕按下的行為
這裡我們會判斷是否還在播放來決定要不要進下一步 `DoRefresh()`

#### `DoRefresh()`
對我們在前面開的 port 發送 `refresh/`，也就是處理新的影片
處理完後再呼叫下一步 `GetFrameData()`。

#### `GetFrameData()`
取得處理完後的 json 和 音樂檔。值得注意的是我在網址後面還加了`?_="+new Date().getTime())`，避免瀏覽器的快取機制亂了我們的好事。
完成後呼叫 `DrawFrame()`，開始繪圖！

#### `DrawFrame()`
畫一幀的圖。這裡我有加入判斷當前繪製的幀數是不是有跟現實時間同步，避免電腦太爛或太好造成影音不同步的問題

最後再把進入點 `OnPlayButtonClicked()` 綁在按鈕身上就完成了！



<!-- https://www.youtube.com/watch?v=k6LB6nrkoJU -->

