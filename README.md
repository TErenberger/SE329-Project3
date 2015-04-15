# SE329-Project4
Team Anime Sucks - Tab Manager


##Install Guide

1. Clone Repo.
2. Install Chrome Extension: 
[Chrome Extension Developer Tools](https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc?utm_source=chrome-app-launcher-info-dialog)

3. Run the Chrome developer extension.
4. "Click Extensions" at the top, then click "Load Unpacked".
![](http://i.imgur.com/uikpFft.png)
5. Choose the root directory of your cloned repo.
6. Verify install. There should be an icon added to your main toolbar.

##Extension in the regular window

For debugging purposes it can be easier to work with the console/html/css tools if the extension is run in its own tab rather than spawned by clicking the extension icon.

To do this:

![](http://i.imgur.com/8PpYBGV.png)

1. open url: chrome://extensions/
2. copy ID (outlined above).

3. open url: chrome-extension://{paste id here}/popup.html.
(e.g. chrome-extension://djjeggeokhpgaojgjephfgkdlajhhngk/popup.html)
4. open console as you would a normal webpage.
