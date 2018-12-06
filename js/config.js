var DeviceType = {
    Android: "Android",
    iPhone: "iPhone",
    iPad: "iPad",
    Desktop: "Desktop"
};
var Device;
if (navigator.platform.indexOf("Android") > -1 || navigator.platform.indexOf("Linux") > -1) {
    Device = DeviceType.Android;
}
else if(navigator.platform.indexOf("iPhone") > -1) {
    Device = DeviceType.iPhone;
}
else if(navigator.platform.indexOf("iPad") > -1){
    Device = DeviceType.iPad;
}
else {
    Device = DeviceType.Desktop;
}
