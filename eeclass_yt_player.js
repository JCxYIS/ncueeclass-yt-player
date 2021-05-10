// ==UserScript==
// @name         NCU-eeclass Youtube Player
// @namespace    http://jcxyis.me/
// @version      0.1
// @description  os hw 2
// @author       JCxYIS
// @match        https://ncueeclass.ncu.edu.tw/dashboard/myTimeTable

//// @grant        GM.getResourceText
//// @resource dataUrlRes http://localhost:8763/output
// ==/UserScript==

(async function() {
    'use strict';

    // Your code here...

    // init grids
    let a = document.getElementsByClassName("  text-center  col-char4")
    let grids = [] // [Y][X]
    let pushCount = 0
    for(let i = 0; i < a.length; i++)
    {
        if(a[i].childNodes[0].className == "")
        {
            if(pushCount % 7 == 0)
            {
                grids.push([])
            }
            // 沒有span就加
            if(!a[i].childNodes[0].childNodes[0])
            {
                //console.log("a")
                let newChild = document.createElement("span");
                a[i].childNodes[0].appendChild(newChild)
            }
            // 有其他child就刪
            if(a[i].childNodes[0].childNodes[2])
            {
                //console.log(a[i].childNodes[0].childNodes[2])
                a[i].childNodes[0].removeChild(a[i].childNodes[0].childNodes[2])
            }
            // 套css並加到grid
            a[i].childNodes[0].childNodes[0].style.cssText = "word-break:break-all; " // font-family:monospace;
            grids[Math.floor(pushCount/7)].push(a[i].childNodes[0].childNodes[0])
            pushCount++
        }
    }
    console.log(grids)
    const YCOUNT = grids.length // 10
    const XCOUNT = grids[0].length // 7

    // create audio
    let bgm = document.createElement('audio')    
    bgm.preload = 'none'

    // where should we insert the function butt/ input?
    let insertPos = document.getElementsByClassName("row")[7] // insertPos
    insertPos.setAttribute("style", "text-align: center; font-family:monospace;")

    // create youtube url input
    let urlInput = document.createElement("input");
    urlInput.value = "https://youtu.be/FtutLA63Cp8"
    urlInput.setAttribute("style", "width: 50%")
    insertPos.append(urlInput)

    // create START button
    let startButt = document.createElement("button")
    startButt.innerHTML = "Play";
    startButt.setAttribute("onclick", "StartBadApple()")
    startButt.setAttribute("style", "background-color:black; color:white; margin-left: 1em")
    insertPos.appendChild(startButt)

//    DrawFrame(0);

/* -------------------------------------------------------------------------- */

    // load frame datas
    //let data = await GM.getResourceText("dataUrlRes")
    //data = JSON.parse(data) // data[FRAME][Y][X]

    // frame data
    let data = null  // [][][]
    let FRAME_COUNT  // 4382
    let WIDTH_COUNT  // 36
    let HEIGHT_COUNT // 28
    let FPS = 30
    // console.log(data.length+", "+data[0].length+", "+data[0][0].length);

    function ResetPlayButt()
    {
        startButt.innerHTML = "Play"    
        startButt.disabled = false
    }

    function OnPlayButtonClicked()
    {
        console.log(urlInput.value);
        if(frame == 0 || frame >= FRAME_COUNT-1)
        {
            DoRefresh()
        }
        else
        {
            console.log("still playing!")
        }
    }

    function DoRefresh()
    {
        if(!urlInput.value)
        {
            alert("網址不可為空")
            return;
        }

        startButt.innerHTML = "Processing"
        startButt.disabled = true

        let request = new XMLHttpRequest();
        //request.responseType = 'text';
        request.open('POST', "http://localhost:8763/refresh")
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onload = ()=>{
            console.log("Refresh OK")
            GetFrameData();
        }
        request.onerror = ()=>{
            alert("Error: 網址格式錯誤或是還沒開啟伺服器")
            ResetPlayButt()
        }
        request.send("url="+urlInput.value)
    }

    // 取得 json 資訊
    function GetFrameData()
    {
        // send ajax to fetch frame datas
        startButt.innerHTML = "Fetching Frame Data"
        startButt.disabled = true

        let request = new XMLHttpRequest();
        request.open('GET', "http://localhost:8763/output?_="+new Date().getTime())
        request.responseType = 'text';
        request.onload = ()=>{
            console.log("download json OK")
            data = JSON.parse(request.response) // data[FRAME][Y][X]
            
            console.log("parse json OK")
            FRAME_COUNT = data["frames"]  //data.length
            WIDTH_COUNT = data["width"] //data[0][0].length
            HEIGHT_COUNT = data["height"] //data[0].length
            FPS = data["fps"] // 30
            data = data["data"]
            
            bgm.src = "http://localhost:8763/audio?_="+new Date().getTime()
            bgm.load()
            bgm.play()
            
            frame = 0
            DrawFrame()
        };
        request.onerror = (e)=>{
            alert("Error: 網址格式錯誤或是還沒開啟伺服器")
            ResetPlayButt()
        }

        request.send();
    }
    
    // Main Function
    let frame = 0
    let start_time
    function DrawFrame()
    {
        let now_time = Date.now()
        let delay_next_frame = 0
        if(frame != 0)
        {
            let millisec_slower = (now_time-start_time) - (frame/FPS*1000) // 慢了幾毫秒
            delay_next_frame = -millisec_slower
            // console.log((now_time-start_time)+" (Frame "+frame+"): "+millisec_slower)
        }
        else
        {
            start_time = now_time
        }

        if(frame >= FRAME_COUNT)
        {
            console.log("Done playing. Thank you.")
            ResetPlayButt()
            return;
        }

        for(let i = 0; i < YCOUNT; i++)
        {
            for(let j = 0; j < XCOUNT; j++)
            {
                let str = ""
                for(let fi = 0; fi < 2; fi++) // 每格的橫行 2 字
                {
                    for(let fj = 0; fj < 6; fj++) // 每格的直列 10 字
                    {
                        str += data[frame][ Math.floor( ((2)*i+fi) /2/YCOUNT*HEIGHT_COUNT )][ Math.floor( ((6)*j+fj) /6/XCOUNT*WIDTH_COUNT )]==0 ? "蘋":"一"
                    }
                    str += "<br>";
                }
                grids[i][j].innerHTML = str; // write grid
            }
        }

        startButt.innerHTML = "Now Playing #"+frame        
        setTimeout(()=>{frame++; DrawFrame();}, 1000/FPS + delay_next_frame) // 原黨 30 FPS
    }

    // 把功能註冊進瀏覽器視窗
    unsafeWindow.StartBadApple = function()
    {
        OnPlayButtonClicked();
    }

})();