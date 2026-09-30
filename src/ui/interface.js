var inPacketTracer = typeof $se === "function";
var appVersion = "1.3.0";
var storageKey = "ptforge.workspace";

var app = {
    files: {},
    order: [],
    open: [],
    active: null,
    editors: {},
    folder: null,
    nextId: 1,
    fontSize: 14,
    view: "explorer",
    sidebarVisible: true,
    sidebarWidth: 260,
    panelVisible: true,
    panelHeight: 210,
    panelTab: "output",
    problems: [],
    pendingSaves: {},
    running: false,
    devices: null,
    reports: [],
    browserFolder: {},
    snapshots: [],
    termHistory: [],
    panelMax: false
};

var icons = {
    files: "<path d='M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z'/>",
    search: "<path d='M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1 8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5z'/>",
    snippets: "<path fill-rule='evenodd' clip-rule='evenodd' d='M2.5 1l-.5.5V13h1V2h11v11h1V1.5l-.5-.5h-12zM2 15v-1h1v1H2zm3-1H4v1h1v-1zm1 0h1v1H6v-1zm3 0H8v1h1v-1zm1 0h1v1h-1v-1zm5 1v-1h-1v1h1zm-3-1h1v1h-1v-1z'/>",
    devices: "<path d='M6 3h4v1H6V3zm0 6h4v1H6V9zm0 2h4v1H6v-1zm9.14 5H.86l1.25-5H4V2a.95.95 0 0 1 .078-.383c.052-.12.123-.226.211-.32a.922.922 0 0 1 .32-.219A1.01 1.01 0 0 1 5 1h6a.95.95 0 0 1 .383.078c.12.052.226.123.32.211a.922.922 0 0 1 .219.32c.052.125.078.256.078.391v9h1.89l1.25 5zM5 13h6V2H5v11zm8.86 2l-.75-3H12v2H4v-2H2.89l-.75 3h11.72z'/>",
    tools: "<path fill-rule='evenodd' clip-rule='evenodd' d='M14.773 3.485l-.78-.184-2.108 2.096-1.194-1.216 2.056-2.157-.18-.792a4.42 4.42 0 0 0-1.347-.228 3.64 3.64 0 0 0-1.457.28 3.824 3.824 0 0 0-1.186.84 3.736 3.736 0 0 0-.875 1.265 3.938 3.938 0 0 0 0 2.966 335.341 335.341 0 0 0-6.173 6.234c-.21.275-.31.618-.284.963a1.403 1.403 0 0 0 .464.967c.124.135.272.247.437.328.17.075.353.118.538.127.316-.006.619-.126.854-.337 1.548-1.457 4.514-4.45 6.199-6.204.457.194.948.294 1.444.293a3.736 3.736 0 0 0 2.677-1.133 3.885 3.885 0 0 0 1.111-2.73 4.211 4.211 0 0 0-.196-1.378zM2.933 13.928a.31.31 0 0 1-.135.07.437.437 0 0 1-.149 0 .346.346 0 0 1-.144-.057.336.336 0 0 1-.114-.11c-.14-.143-.271-.415-.14-.568 1.37-1.457 4.191-4.305 5.955-6.046.1.132.21.258.328.376.118.123.245.237.38.341-1.706 1.75-4.488 4.564-5.98 5.994zm11.118-9.065c.002.765-.296 1.5-.832 2.048a2.861 2.861 0 0 1-4.007 0 2.992 2.992 0 0 1-.635-3.137A2.748 2.748 0 0 1 10.14 2.18a2.76 2.76 0 0 1 1.072-.214h.254L9.649 3.839v.696l1.895 1.886h.66l1.847-1.816v.258zM3.24 6.688h1.531l.705.717.678-.674-.665-.678V6.01l.057-1.649-.22-.437-2.86-1.882-.591.066-.831.849-.066.599 1.838 2.918.424.215zm-.945-3.632L4.609 4.58 4.57 5.703H3.494L2.002 3.341l.293-.285zm7.105 6.96l.674-.673 3.106 3.185a1.479 1.479 0 0 1 0 2.039 1.404 1.404 0 0 1-1.549.315 1.31 1.31 0 0 1-.437-.315l-3.142-3.203.679-.678 3.132 3.194a.402.402 0 0 0 .153.105.477.477 0 0 0 .359 0 .403.403 0 0 0 .153-.105.436.436 0 0 0 .1-.153.525.525 0 0 0 .036-.184.547.547 0 0 0-.035-.184.436.436 0 0 0-.1-.153L9.4 10.016z'/>",
    checks: "<path fill-rule='evenodd' clip-rule='evenodd' d='M3.75 4.48h-.71L2 3.43l.71-.7.69.68L4.81 2l.71.71-1.77 1.77zM6.99 3h8v1h-8V3zm0 3h8v1h-8V6zm8 3h-8v1h8V9zm-8 3h8v1h-8v-1zM3.04 7.48h.71l1.77-1.77-.71-.7L3.4 6.42l-.69-.69-.71.71 1.04 1.04zm.71 3.01h-.71L2 9.45l.71-.71.69.69 1.41-1.42.71.71-1.77 1.77zm-.71 3.01h.71l1.77-1.77-.71-.71-1.41 1.42-.69-.69-.71.7 1.04 1.05z'/>",
    newFile: "<path fill-rule='evenodd' clip-rule='evenodd' d='M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z'/>",
    openFile: "<path fill-rule='evenodd' clip-rule='evenodd' d='M6 5.914l2.06-2.06v-.708L5.915 1l-.707.707.043.043.25.25 1 1h-3a2.5 2.5 0 0 0 0 5H4V7h-.5a1.5 1.5 0 1 1 0-3h3L5.207 5.293 5.914 6 6 5.914zM11 2H8.328l-1-1H12l.71.29 3 3L16 5v9l-1 1H6l-1-1V6.5l1 .847V14h9V6h-4V2zm1 0v3h3l-3-3z'/>",
    refresh: "<path fill-rule='evenodd' clip-rule='evenodd' d='M4.681 3H2V2h3.5l.5.5V6H5V4a5 5 0 1 0 4.53-.761l.302-.954A6 6 0 1 1 4.681 3z'/>",
    close: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z'/>",
    run: "<path d='M3.78 2L3 2.41v12l.78.42 9-6V8l-9-6zM4 13.48V3.35l7.6 5.07L4 13.48z'/>",
    runFill: "<path fill-rule='evenodd' clip-rule='evenodd' d='M4.25 3l1.166-.624 8 5.333v1.248l-8 5.334-1.166-.624V3zm1.5 1.401v7.864l5.898-3.932L5.75 4.401z'/>",
    trash: "<path fill-rule='evenodd' clip-rule='evenodd' d='M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z'/>",
    edit: "<path d='M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z'/>",
    error: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7-2.4 2.5 2.4 2.5-.7.7-2.4-2.5-2.4 2.5-.7-.7 2.4-2.5-2.4-2.5.7-.7 2.4 2.5z'/>",
    warning: "<path fill-rule='evenodd' clip-rule='evenodd' d='M7.56 1h.88l6.54 12.26-.44.74H1.44L1 13.26 7.56 1zM8 2.28L2.28 13H13.7L8 2.28zM8.625 12v-1h-1.25v1h1.25zm-1.25-2V6h1.25v4h-1.25z'/>",
    info: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8.568 1.031A6.8 6.8 0 0 1 12.76 3.05a7.06 7.06 0 0 1 .46 9.39 6.85 6.85 0 0 1-8.58 1.74 7 7 0 0 1-3.12-3.5 7.12 7.12 0 0 1-.23-4.71 7 7 0 0 1 2.77-3.79 6.8 6.8 0 0 1 4.508-1.149zM9.04 13.88a5.89 5.89 0 0 0 3.41-2.07 6.07 6.07 0 0 0-.4-8.06 5.82 5.82 0 0 0-7.43-.74 6.06 6.06 0 0 0 .5 10.29 5.81 5.81 0 0 0 3.92.58zM7.375 6h1.25V5h-1.25v1zm1.25 1v4h-1.25V7h1.25z'/>",
    chevron: "<path fill-rule='evenodd' clip-rule='evenodd' d='M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z'/>",
    textFile: "<path fill-rule='evenodd' clip-rule='evenodd' d='M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z'/>",
    folder: "<path d='M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z'/>",
    server: "<path fill-rule='evenodd' clip-rule='evenodd' d='M2.5 5L2 4.5v-3l.5-.5h11l.5.5v3l-.5.5h-11zM10 2H9v1H8V2H7v1H6V2H5v1H4V2H3v2h10V2h-2v1h-1V2zm-7.5 8L2 9.5v-3l.5-.5h11l.5.5v3l-.5.5h-11zM6 7H5v1H4V7H3v2h10V7h-2v1h-1V7H9v1H8V7H7v1H6V7zm7.5 8l.5-.5v-3l-.5-.5h-11l-.5.5v3l.5.5h11zM3 14v-2h1v1h1v-1h1v1h1v-1h1v1h1v-1h1v1h1v-1h2v2H3z'/>",
    cloud: "<path fill-rule='evenodd' clip-rule='evenodd' d='M11.957 6h.05a2.99 2.99 0 0 1 2.116.879 3.003 3.003 0 0 1 0 4.242 2.99 2.99 0 0 1-2.117.879v-.013L12 12H4.523a3.486 3.486 0 0 1-2.628-1.16 3.502 3.502 0 0 1 1.958-5.78 3.462 3.462 0 0 1 1.468.04 3.486 3.486 0 0 1 3.657-2.06A3.479 3.479 0 0 1 11.957 6zM5 11h7.01a1.994 1.994 0 0 0 1.992-2 2.002 2.002 0 0 0-1.996-2h-.914l-.123-.857a2.49 2.49 0 0 0-2.126-2.122A2.478 2.478 0 0 0 6.231 5.5l-.333.762-.809-.189A2.49 2.49 0 0 0 4.523 6c-.662 0-1.297.263-1.764.732A2.503 2.503 0 0 0 4.523 11H5z'/>",
    wireless: "<path fill-rule='evenodd' clip-rule='evenodd' d='M2.998 5.58a5.55 5.55 0 0 1 1.62-3.88l-.71-.7a6.45 6.45 0 0 0 0 9.16l.71-.7a5.55 5.55 0 0 1-1.62-3.88zm1.06 0a4.42 4.42 0 0 0 1.32 3.17l.71-.71a3.27 3.27 0 0 1-.76-1.12 3.45 3.45 0 0 1 0-2.67 3.22 3.22 0 0 1 .76-1.13l-.71-.71a4.46 4.46 0 0 0-1.32 3.17zm7.65 3.21l-.71-.71c.33-.32.59-.704.76-1.13a3.449 3.449 0 0 0 0-2.67 3.22 3.22 0 0 0-.76-1.13l.71-.7a4.468 4.468 0 0 1 0 6.34zM13.068 1l-.71.71a5.43 5.43 0 0 1 0 7.74l.71.71a6.45 6.45 0 0 0 0-9.16zM9.993 5.43a1.5 1.5 0 0 1-.245.98 2 2 0 0 1-.27.23l3.44 7.73-.92.4-.77-1.73h-5.54l-.77 1.73-.92-.4 3.44-7.73a1.52 1.52 0 0 1-.33-1.63 1.55 1.55 0 0 1 .56-.68 1.5 1.5 0 0 1 2.325 1.1zm-1.595-.34a.52.52 0 0 0-.25.14.52.52 0 0 0-.11.22.48.48 0 0 0 0 .29c.04.09.102.17.18.23a.54.54 0 0 0 .28.08.51.51 0 0 0 .5-.5.54.54 0 0 0-.08-.28.58.58 0 0 0-.23-.18.48.48 0 0 0-.29 0zm.23 2.05h-.27l-.87 1.94h2l-.86-1.94zm2.2 4.94l-.89-2h-2.88l-.89 2h4.66z'/>",
    bell: "<path d='M13.377 10.573a7.63 7.63 0 0 1-.383-2.38V6.195a5.115 5.115 0 0 0-1.268-3.446 5.138 5.138 0 0 0-3.242-1.722c-.694-.072-1.4 0-2.07.227-.67.215-1.28.574-1.794 1.053a4.923 4.923 0 0 0-1.208 1.675 5.067 5.067 0 0 0-.431 2.022v2.2a7.61 7.61 0 0 1-.383 2.37L2 12.343l.479.658h3.505c0 .526.215 1.04.586 1.412.37.37.885.586 1.412.586.526 0 1.04-.215 1.411-.586s.587-.886.587-1.412h3.505l.478-.658-.586-1.77zm-4.69 3.147a.997.997 0 0 1-.705.299.997.997 0 0 1-.706-.3.997.997 0 0 1-.3-.705h1.999a.939.939 0 0 1-.287.706zm-5.515-1.71l.371-1.114a8.633 8.633 0 0 0 .443-2.691V6.004c0-.563.12-1.113.347-1.616.227-.514.55-.969.969-1.34.419-.382.91-.67 1.436-.837.538-.18 1.1-.24 1.65-.18a4.147 4.147 0 0 1 2.597 1.4 4.133 4.133 0 0 1 1.004 2.776v2.01c0 .909.144 1.818.443 2.691l.371 1.113h-9.63v-.012z'/>",
    split: "<path d='M14 1H3L2 2v11l1 1h11l1-1V2l-1-1zM8 13H3V2h5v11zm6 0H9V2h5v11z'/>",
    clear: "<path d='M10 12.6l.7.7 1.6-1.6 1.6 1.6.8-.7L13 11l1.7-1.6-.8-.8-1.6 1.7-1.6-1.7-.7.8 1.6 1.6-1.6 1.6zM1 4h14V3H1v1zm0 3h14V6H1v1zm8 2.5V9H1v1h8v-.5zM9 13v-1H1v1h8z'/>",
    maximize: "<path d='M3 12h10V4H3v8zm2-6h6v4H5V6zM2 6H1V2.5l.5-.5H5v1H2v3zm13-3.5V6h-1V3h-3V2h3.5l.5.5zM14 10h1v3.5l-.5.5H11v-1h3v-3zM2 13h3v1H1.5l-.5-.5V10h1v3z'/>",
    replaceToggle: "<path fill-rule='evenodd' clip-rule='evenodd' d='M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z'/>",
    arrowUp: "<path fill-rule='evenodd' clip-rule='evenodd' d='M13.854 7l-5-5h-.707l-5 5 .707.707L8 3.561V14h1V3.56l4.146 4.147.708-.707z'/>",
    arrowDown: "<path fill-rule='evenodd' clip-rule='evenodd' d='M3.147 9l5 5h.707l5-5-.707-.707L9 12.439V2H8v10.44L3.854 8.292 3.147 9z'/>",
    replaceOne: "<path fill-rule='evenodd' clip-rule='evenodd' d='M3.221 3.739l2.261 2.269L7.7 3.784l-.7-.7-1.012 1.007-.008-1.6a.523.523 0 0 1 .5-.526H8V1H6.48A1.482 1.482 0 0 0 5 2.489V4.1L3.927 3.033l-.706.706zm6.67 1.794h.01c.183.311.451.467.806.467.393 0 .706-.168.94-.503.236-.335.353-.78.353-1.333 0-.511-.1-.913-.301-1.207-.201-.295-.488-.442-.86-.442-.405 0-.718.194-.938.581h-.01V1H9v4.919h.89v-.386zm-.015-1.061v-.34c0-.248.058-.448.175-.601a.54.54 0 0 1 .445-.23.49.49 0 0 1 .436.233c.104.154.155.368.155.643 0 .33-.056.587-.169.768a.524.524 0 0 1-.47.27.495.495 0 0 1-.411-.211.853.853 0 0 1-.16-.532zM9 12.769c-.256.154-.625.231-1.108.231-.563 0-1.02-.178-1.369-.533-.349-.355-.523-.813-.523-1.374 0-.648.186-1.158.56-1.53.374-.376.875-.563 1.5-.563.433 0 .746.06.94.179v.998a1.26 1.26 0 0 0-.792-.276c-.325 0-.583.1-.774.298-.19.196-.283.468-.283.816 0 .338.09.603.272.797.182.191.431.287.749.287.282 0 .558-.092.828-.276v.946zM4 7L3 8v6l1 1h7l1-1V8l-1-1H4zm0 1h7v6H4V8z'/>",
    replaceAll: "<path fill-rule='evenodd' clip-rule='evenodd' d='M11.6 2.677c.147-.31.356-.465.626-.465.248 0 .44.118.573.353.134.236.201.557.201.966 0 .443-.078.798-.235 1.067-.156.268-.365.402-.627.402-.237 0-.416-.125-.537-.374h-.008v.31H11V1h.593v1.677h.008zm-.016 1.1a.78.78 0 0 0 .107.426c.071.113.163.169.274.169.136 0 .24-.072.314-.216.075-.145.113-.35.113-.615 0-.22-.035-.39-.104-.514-.067-.124-.164-.187-.29-.187-.12 0-.219.062-.297.185a.886.886 0 0 0-.117.48v.272zM4.12 7.695L2 5.568l.662-.662 1.006 1v-1.51A1.39 1.39 0 0 1 5.055 3H7.4v.905H5.055a.49.49 0 0 0-.468.493l.007 1.5.949-.944.656.656-2.08 2.085zM9.356 4.93H10V3.22C10 2.408 9.685 2 9.056 2c-.135 0-.285.024-.45.073a1.444 1.444 0 0 0-.388.167v.665c.237-.203.487-.304.75-.304.261 0 .392.156.392.469l-.6.103c-.506.086-.76.406-.76.961 0 .263.061.473.183.631A.61.61 0 0 0 8.69 5c.29 0 .509-.16.657-.48h.009v.41zm.004-1.355v.193a.75.75 0 0 1-.12.436.368.368 0 0 1-.313.17.276.276 0 0 1-.22-.095.38.38 0 0 1-.08-.248c0-.222.11-.351.332-.389l.4-.067zM7 12.93h-.644v-.41h-.009c-.148.32-.367.48-.657.48a.61.61 0 0 1-.507-.235c-.122-.158-.183-.368-.183-.63 0-.556.254-.876.76-.962l.6-.103c0-.313-.13-.47-.392-.47-.263 0-.513.102-.75.305v-.665c.095-.063.224-.119.388-.167.165-.049.315-.073.45-.073.63 0 .944.407.944 1.22v1.71zm-.64-1.162v-.193l-.4.068c-.222.037-.333.166-.333.388 0 .1.027.183.08.248a.276.276 0 0 0 .22.095.368.368 0 0 0 .312-.17c.08-.116.12-.26.12-.436zM9.262 13c.321 0 .568-.058.738-.173v-.71a.9.9 0 0 1-.552.207.619.619 0 0 1-.5-.215c-.12-.145-.181-.345-.181-.598 0-.26.063-.464.189-.612a.644.644 0 0 1 .516-.223c.194 0 .37.069.528.207v-.749c-.129-.09-.338-.134-.626-.134-.417 0-.751.14-1.001.422-.249.28-.373.662-.373 1.148 0 .42.116.764.349 1.03.232.267.537.4.913.4zM2 9l1-1h9l1 1v5l-1 1H3l-1-1V9zm1 0v5h9V9H3zm3-2l1-1h7l1 1v5l-1 1V7H6z'/>",
    debug: "<path d='M10.94 13.5l-1.32 1.32a3.73 3.73 0 0 0-7.24 0L1.06 13.5 0 14.56l1.72 1.72-.22.22V18H0v1.5h1.5v.08c.077.489.214.966.41 1.42L0 22.94 1.06 24l1.65-1.65A4.308 4.308 0 0 0 6 24a4.31 4.31 0 0 0 3.29-1.65L10.94 24 12 22.94 10.09 21c.198-.464.336-.951.41-1.45v-.1H12V18h-1.5v-1.5l-.22-.22L12 14.56l-1.06-1.06zM6 13.5a2.25 2.25 0 0 1 2.25 2.25h-4.5A2.25 2.25 0 0 1 6 13.5zm3 6a3.33 3.33 0 0 1-3 3 3.33 3.33 0 0 1-3-3v-2.25h6v2.25zm14.76-9.9v1.26L13.5 17.37V15.6l8.5-5.37L9 2v9.46a5.07 5.07 0 0 0-1.5-.72V.63L8.64 0l15.12 9.6z'/>",
    stepOver: "<path fill-rule='evenodd' clip-rule='evenodd' d='M14.25 5.75v-4h-1.5v2.542c-1.145-1.359-2.911-2.209-4.84-2.209-3.177 0-5.92 2.307-6.16 5.398l-.02.269h1.501l.022-.226c.212-2.195 2.202-3.94 4.656-3.94 1.736 0 3.244.875 4.05 2.166h-2.83v1.5h4.163l.962-.975V5.75h-.004zM8 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'/>",
    stepInto: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8 9.532h.542l3.905-3.905-1.061-1.06-2.637 2.61V1H7.251v6.177l-2.637-2.61-1.061 1.06 3.905 3.905H8zm1.956 3.481a2 2 0 1 1-4 0 2 2 0 0 1 4 0z'/>",
    stepOut: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8 1h-.542L3.553 4.905l1.061 1.06 2.637-2.61v6.177h1.498V3.355l2.637 2.61 1.061-1.06L8.542 1H8zm1.956 12.013a2 2 0 1 1-4 0 2 2 0 0 1 4 0z'/>",
    stepBack: "<path fill-rule='evenodd' clip-rule='evenodd' d='M1.75 5.75v-4h1.5v2.542c1.145-1.359 2.911-2.209 4.84-2.209 3.177 0 5.92 2.307 6.16 5.398l.02.269h-1.5l-.022-.226c-.212-2.195-2.202-3.94-4.656-3.94-1.736 0-3.244.875-4.05 2.166h2.83v1.5H2.707l-.961-.975V5.75h.003zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'/>",
    restart: "<path fill-rule='evenodd' clip-rule='evenodd' d='M12.75 8a4.5 4.5 0 0 1-8.61 1.834l-1.391.565A6.001 6.001 0 0 0 14.25 8 6 6 0 0 0 3.5 4.334V2.5H2v4l.75.75h3.5v-1.5H4.352A4.5 4.5 0 0 1 12.75 8z'/>",
    stop: "<path fill-rule='evenodd' clip-rule='evenodd' d='M13 1.99976L14 2.99976V12.9998L13 13.9998H3L2 12.9998L2 2.99976L3 1.99976H13ZM12.7461 3.25057L3.25469 3.25057L3.25469 12.7504H12.7461V3.25057Z'/>",
    terminal: "<path fill-rule='evenodd' clip-rule='evenodd' d='M1.5 3L3 1.5H21L22.5 3V21L21 22.5H3L1.5 21V3ZM3 3V21H21V3H3Z'/><path d='M7.06078 7.49988L6.00012 8.56054L10.2427 12.8032L6 17.0459L7.06066 18.1066L12 13.1673V12.4391L7.06078 7.49988Z'/><rect x='12' y='16.5' width='6' height='1.5'/>",
    add: "<path d='M14 7v1H8v6H7V8H1V7h6V1h1v6h6z'/>",
    chevronDown: "<path fill-rule='evenodd' clip-rule='evenodd' d='M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z'/>",
    chevronUp: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8.024 5.928l-4.357 4.357-.62-.618L7.716 5h.618L13 9.667l-.619.618-4.357-4.357z'/>",
    pulse: "<path d='M11.8 9L10 3H9L7.158 9.64 5.99 4.69h-.97L3.85 9H1v.99h3.23l.49-.37.74-2.7L6.59 12h1.03l1.87-7.04 1.46 4.68.48.36H15V9h-3.2z'/>",
    diff: "<path fill-rule='evenodd' clip-rule='evenodd' d='M2 3.5l.5-.5h5l.5.5v9l-.5.5h-5l-.5-.5v-9zM3 12h4V6H3v6zm0-7h4V4H3v1zm6.5-2h5l.5.5v9l-.5.5h-5l-.5-.5v-9l.5-.5zm.5 9h4v-2h-4v2zm0-4h4V4h-4v4z'/>",
    snapshot: "<path fill-rule='evenodd' clip-rule='evenodd' d='M10.707 3H14.5l.5.5v9l-.5.5h-13l-.5-.5v-9l.5-.5h3.793l.853-.854L6.5 2h3l.354.146.853.854zM2 12h12V4h-3.5l-.354-.146L9.293 3H6.707l-.853.854L5.5 4H2v8zm1.5-7a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zM8 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-1a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'/>",
    collapseAll: "<path d='M9 9H4v1h5V9z'/><path fill-rule='evenodd' clip-rule='evenodd' d='M5 3l1-1h7l1 1v7l-1 1h-2v2l-1 1H3l-1-1V6l1-1h2V3zm1 2h4l1 1v4h2V3H6v2zm4 1H3v7h7V6z'/>",
    breakpoints: "<path d='M15 5.5a4.394 4.394 0 0 1-4 4.5 2.955 2.955 0 0 0-.2-1A3.565 3.565 0 0 0 14 5.5a3.507 3.507 0 0 0-7-.3A3.552 3.552 0 0 0 6 5a4.622 4.622 0 0 1 4.5-4A4.481 4.481 0 0 1 15 5.5zM5.5 6a4.5 4.5 0 1 0 0 9.001 4.5 4.5 0 0 0 0-9z'/>",
    closeAll: "<path fill-rule='evenodd' clip-rule='evenodd' d='M8.621 8.086l-.707-.707L6.5 8.793 5.086 7.379l-.707.707L5.793 9.5l-1.414 1.414.707.707L6.5 10.207l1.414 1.414.707-.707L7.207 9.5l1.414-1.414z'/><path fill-rule='evenodd' clip-rule='evenodd' d='M5 3l1-1h7l1 1v7l-1 1h-2v2l-1 1H3l-1-1V6l1-1h2V3zm1 2h4l1 1v4h2V3H6v2zm4 1H3v7h7V6z'/>",
    extensions: "<path fill-rule='evenodd' clip-rule='evenodd' d='M13.5 1.5L15 0h7.5L24 1.5V9l-1.5 1.5H15L13.5 9V1.5zm1.5 0V9h7.5V1.5H15zM0 15V6l1.5-1.5H9L10.5 6v7.5H18l1.5 1.5v7.5L18 24H1.5L0 22.5V15zm9-1.5V6H1.5v7.5H9zM9 15H1.5v7.5H9V15zm1.5 7.5H18V15h-7.5v7.5z'/>",
    pass: "<path d='M6.27 10.87h.71l4.56-4.56-.71-.71-4.2 4.21-1.92-1.92L4 8.6l2.27 2.27z'/><path fill-rule='evenodd' clip-rule='evenodd' d='M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6z'/>",
    gear: "<path d='M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z'/>",
    jsFile: "<g transform='scale(1.5)'><path d='M2 1h12v14H2z' fill='none'/><text x='1.5' y='12.5' font-size='10' font-weight='700' font-family='Segoe UI,Arial' fill='#cbcb41'>JS</text></g>",
    router: "<g transform='scale(1.5)'><circle cx='8' cy='8' r='6.2' fill='none' stroke='currentColor' stroke-width='1.2'/><path d='M4.5 8h7M8 4.5v7M6 6.5L8 4.5l2 2M6 9.5l2 2 2-2' fill='none' stroke='currentColor' stroke-width='1'/></g>",
    pc: "<g transform='scale(1.5)'><rect x='2' y='2.5' width='12' height='8' rx='.8' fill='none' stroke='currentColor' stroke-width='1.2'/><path d='M6 13.5h4M8 10.5v3' stroke='currentColor' stroke-width='1.2'/></g>",
    calculator: "<g transform='scale(1.5)'><path d='M3.5 1h9l.5.5v13l-.5.5h-9l-.5-.5v-13l.5-.5zM4 2v12h8V2H4zm1 1h6v3H5V3zm1 1v1h4V4H6zM5 7.5h1.5V9H5V7.5zm2.25 0h1.5V9h-1.5V7.5zm2.25 0H11V9H9.5V7.5zM5 10h1.5v1.5H5V10zm2.25 0h1.5v1.5h-1.5V10zm2.25 0H11v3H9.5v-3zM5 12h3.75v1H5v-1z'/></g>",
    switch: "<g transform='scale(1.5)'><path d='M1.5 5h13l.5.5v5l-.5.5h-13l-.5-.5v-5l.5-.5zM2 6v4h12V6H2zm1 1h1v2H3V7zm2 0h1v2H5V7zm2 0h1v2H7V7zm2 0h1v2H9V7zm3 .5h1v1h-1v-1z'/><path d='M4 3.5h3v1H4v-1zm5 0h3v1H9v-1zM4 11.5h3v1H4v-1zm5 0h3v1H9v-1z'/></g>"
};

function icon(name, css) {
    return "<svg class=\"ico" + (css ? " " + css : "") + "\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">" + (icons[name] || "") + "</svg>";
}

function byId(id) {
    return document.getElementById(id);
}

function storeData(key, value) {
    if (typeof $putData === "function") {
        $putData(key, value);
        return;
    }
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        return;
    }
}

function readData(key, callback) {
    if (typeof $getData === "function") {
        $getData(key).then(function (value) {
            callback(value || "");
        }, function () {
            callback("");
        });
        return;
    }
    var value = "";
    try {
        value = window.localStorage.getItem(key) || "";
    } catch (error) {
        value = "";
    }
    callback(value);
}

function callEngine(name) {
    var args = Array.prototype.slice.call(arguments, 1).map(function (value) {
        return encodeURIComponent(String(value));
    });
    if (!inPacketTracer) {
        return false;
    }
    $se.apply(null, [name].concat(args));
    return true;
}

function sendScript(code) {
    if (!inPacketTracer) {
        return false;
    }
    $se("runCode", encodeURIComponent(code));
    return true;
}

function persist() {
    clearTimeout(app.persistTimer);
    app.persistTimer = setTimeout(persistNow, 300);
}

function persistNow() {
    var fileTabs = app.open.filter(function (id) {
        return !!app.files[id];
    });
    var files = app.order.map(function (id) {
        var f = app.files[id];
        return { id: f.id, name: f.name, path: f.path, text: f.text, saved: f.saved, source: f.source };
    });
    storeData(storageKey, JSON.stringify({
        version: 2,
        files: files,
        open: fileTabs,
        active: app.files[app.active] ? app.active : fileTabs[0] || null,
        nextId: app.nextId,
        folder: app.folder,
        fontSize: app.fontSize,
        view: app.view,
        sidebarVisible: app.sidebarVisible,
        sidebarWidth: app.sidebarWidth,
        panelVisible: app.panelVisible,
        panelHeight: app.panelHeight,
        panelTab: app.panelTab,
        debug: debugSettings(),
        termHistory: terminalState.history.slice(-300)
    }));
}

function timeNow() {
    var d = new Date();
    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }
    return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
}

function fileIcon(name) {
    return /\.js$/i.test(name) ? icon("jsFile", "file-js") : icon("textFile", "file-txt");
}

function isDirty(file) {
    return file.text !== file.saved;
}

function uniqueName(base) {
    var taken = {};
    app.order.forEach(function (id) {
        if (app.files[id].source === "workspace") {
            taken[app.files[id].name.toLowerCase()] = true;
        }
    });
    if (!taken[base.toLowerCase()]) {
        return base;
    }
    var stem = base.replace(/\.[^.]+$/, "");
    var ext = base.substring(stem.length) || ".js";
    for (var i = 2; ; i++) {
        if (!taken[(stem + "-" + i + ext).toLowerCase()]) {
            return stem + "-" + i + ext;
        }
    }
}

function createFile(props) {
    var id = "f" + app.nextId++;
    app.files[id] = {
        id: id,
        name: props.name,
        path: props.path || "",
        text: props.text || "",
        saved: props.saved === undefined ? props.text || "" : props.saved,
        source: props.source || "workspace"
    };
    app.order.push(id);
    return id;
}

function newFile(name, text) {
    var id = createFile({ name: uniqueName(name || "untitled.js"), text: text || "", saved: "" });
    openTab(id);
    return id;
}

function findFileByPath(path) {
    for (var i = 0; i < app.order.length; i++) {
        var f = app.files[app.order[i]];
        if (f.path && f.path === path) {
            return f;
        }
    }
    return null;
}

function openDiskFile(path, name, text, source) {
    var existing = findFileByPath(path);
    if (existing) {
        if (!isDirty(existing)) {
            existing.text = text;
            existing.saved = text;
            if (app.editors[existing.id]) {
                app.editors[existing.id].setValue(text);
            }
        }
        openTab(existing.id);
        return existing.id;
    }
    var id = createFile({ name: name, path: path, text: text, saved: text, source: source || "disk" });
    openTab(id);
    return id;
}

function ensureEditor(id) {
    if (app.editors[id]) {
        return app.editors[id];
    }
    var file = app.files[id];
    var editor = new CodeEditor(byId("editors"), {
        catalog: functionCatalog,
        fontSize: app.fontSize,
        onChange: function (ed) {
            var wasDirty = isDirty(file);
            file.text = ed.getValue();
            if (wasDirty !== isDirty(file)) {
                renderTabs();
                renderExplorer();
            }
            scheduleLint();
            persist();
            debugSourceChanged(id);
            if (app.findOpen) {
                refreshFindCount();
            }
        },
        onGlyphClick: function (line) {
            toggleBreakpoint(id, line);
        },
        onGutterMenu: function (line, event) {
            breakpointMenu(id, line, event);
        },
        onLinesShift: function (change) {
            shiftBreakpoints(id, change);
        },
        onHover: function (info) {
            showDebugHover(info);
        },
        onCursor: function (pos, selected) {
            byId("sb-position").textContent = "Ln " + pos.line + ", Col " + pos.column + (selected ? " (" + selected + " selected)" : "");
            var problem = editor.problemAt(pos.line);
            byId("sb-message").textContent = problem ? problem.message : "";
        }
    });
    editor.setValue(file.text);
    editor.show(false);
    app.editors[id] = editor;
    refreshBreakpointGlyphs(id);
    return editor;
}

function activeEditor() {
    return app.active ? app.editors[app.active] : null;
}

function activeFile() {
    return app.active ? app.files[app.active] : null;
}

function openTab(id) {
    if (app.open.indexOf(id) === -1) {
        app.open.push(id);
    }
    activate(id);
}

function tabInfo(id) {
    if (isViewId(id)) {
        var v = viewTabs[id];
        return { name: v.title, icon: viewTabIcon(v.kind), dirty: false, title: v.title };
    }
    var f = app.files[id];
    return { name: f.name, icon: fileIcon(f.name), dirty: isDirty(f), title: f.path || f.name };
}

function activate(id) {
    app.active = id;
    closeBreakpointWidget();
    hideDebugHover();
    Object.keys(app.editors).forEach(function (key) {
        if (key !== id) {
            app.editors[key].show(false);
        }
    });
    Object.keys(viewTabs).forEach(function (key) {
        showViewTab(key, key === id);
    });
    var hasFile = !!id && !!app.files[id];
    byId("welcome").classList.toggle("hidden", hasFile || isViewId(id));
    byId("editor-title").classList.toggle("hidden", !hasFile);
    if (isViewId(id) && app.findOpen) {
        closeFind();
    }
    if (hasFile) {
        var editor = ensureEditor(id);
        editor.show(true);
        setTimeout(function () {
            editor.focus();
        }, 0);
        if (app.findOpen) {
            runFind();
        }
    }
    renderTabs();
    renderExplorer();
    renderBreadcrumbs();
    lintNow();
    persist();
}

function closeTab(id, force) {
    if (isViewId(id)) {
        var at = app.open.indexOf(id);
        if (at !== -1) {
            app.open.splice(at, 1);
        }
        closeViewTab(id);
        if (app.active === id) {
            activate(app.open[Math.min(at, app.open.length - 1)] || null);
        } else {
            renderTabs();
            renderExplorer();
        }
        return;
    }
    var file = app.files[id];
    if (!file) {
        return;
    }
    if (!force && isDirty(file) && file.source !== "workspace") {
        showDialog({
            title: "Do you want to save the changes you made to " + file.name + "?",
            message: "Your changes will be lost if you don't save them.",
            buttons: ["Save", "Don't Save", "Cancel"]
        }, function (choice) {
            if (choice === 0) {
                file.closeAfterSave = true;
                saveFile(id);
            } else if (choice === 1) {
                file.text = file.saved;
                if (app.editors[id]) {
                    app.editors[id].setValue(file.saved);
                }
                closeTab(id, true);
            }
        });
        return;
    }
    var index = app.open.indexOf(id);
    if (index !== -1) {
        app.open.splice(index, 1);
    }
    if (app.editors[id]) {
        app.editors[id].root.parentNode.removeChild(app.editors[id].root);
        delete app.editors[id];
    }
    if (file.source !== "workspace") {
        if (isDirty(file) && force !== true) {
            return;
        }
        delete app.files[id];
        app.order.splice(app.order.indexOf(id), 1);
    }
    if (app.active === id) {
        activate(app.open[Math.min(index, app.open.length - 1)] || null);
    } else {
        renderTabs();
        renderExplorer();
        persist();
    }
}

function cycleTab(step) {
    if (!app.open.length) {
        return;
    }
    var index = app.open.indexOf(app.active);
    activate(app.open[(index + step + app.open.length) % app.open.length]);
}

function renderTabs() {
    var bar = byId("tabs");
    bar.innerHTML = app.open.map(function (id) {
        var info = tabInfo(id);
        var css = "tab" + (id === app.active ? " active" : "") + (info.dirty ? " dirty" : "");
        return "<div class=\"" + css + "\" data-id=\"" + id + "\" title=\"" + escapeHtml(info.title) + "\">" + info.icon +
            "<span class=\"tab-name\">" + escapeHtml(info.name) + "</span><span class=\"tab-close\" data-close=\"" + id + "\">" + icon("close") + "</span></div>";
    }).join("");
    var active = bar.querySelector(".tab.active");
    if (active && active.scrollIntoView) {
        active.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
}

function renderBreadcrumbs() {
    var f = activeFile();
    var crumbs = byId("breadcrumbs");
    if (!f) {
        crumbs.innerHTML = "";
        return;
    }
    var parts = f.source === "workspace" ? ["Workspace", f.name] : (f.path || f.name).split(/[\\/]/).filter(Boolean).slice(-3);
    crumbs.innerHTML = parts.map(function (p, i) {
        return (i === parts.length - 1 ? fileIcon(f.name) : "") + "<span>" + escapeHtml(p) + "</span>";
    }).join(icon("chevron", "crumb-sep"));
}

function scheduleLint() {
    clearTimeout(app.lintTimer);
    app.lintTimer = setTimeout(lintNow, 350);
}

function lintNow() {
    var editor = activeEditor();
    app.problems = editor ? findProblems(editor.getValue(), functionCatalog) : [];
    if (editor) {
        editor.setProblems(app.problems);
    }
    renderProblems();
}

function renderProblems() {
    var errors = app.problems.filter(function (p) {
        return p.severity === "error";
    }).length;
    var warnings = app.problems.length - errors;
    byId("sb-errors").innerHTML = icon("error") + errors + " " + icon("warning") + warnings;
    var badge = byId("problems-badge");
    badge.textContent = app.problems.length;
    badge.classList.toggle("hidden", !app.problems.length);
    var f = activeFile();
    var body = byId("panel-problems");
    if (!app.problems.length) {
        body.innerHTML = "<div class=\"empty\">No problems have been detected in the workspace.</div>";
        return;
    }
    body.innerHTML = "<div class=\"problem-file\">" + icon("chevron", "open") + fileIcon(f.name) + "<b>" + escapeHtml(f.name) + "</b><span class=\"count\">" + app.problems.length + "</span></div>" +
        app.problems.map(function (p, i) {
            return "<div class=\"problem\" data-index=\"" + i + "\">" + icon(p.severity, "sev-" + p.severity) + "<span class=\"msg\">" + escapeHtml(p.message) +
                "</span><span class=\"src\">" + p.source + "</span><span class=\"loc\">[Ln " + p.line + ", Col " + p.column + "]</span>" +
                (p.suggestion ? "<button class=\"quickfix\" data-fix=\"" + i + "\">Change to " + escapeHtml(p.suggestion) + "</button>" : "") + "</div>";
        }).join("");
}

function applyQuickFix(index) {
    var p = app.problems[index];
    var editor = activeEditor();
    if (!p || !editor || !p.suggestion) {
        return;
    }
    editor.replaceRange(p.offset, p.offset + p.length, p.suggestion);
    lintNow();
}

function addOutput(kind, text) {
    var body = byId("panel-output");
    var row = document.createElement("div");
    row.className = "out " + kind;
    row.innerHTML = "<span class=\"out-time\">[" + timeNow() + "]</span><span class=\"out-kind\">" + kind + "</span>";
    var pre = document.createElement("pre");
    pre.textContent = text;
    row.appendChild(pre);
    body.appendChild(row);
    while (body.children.length > 800) {
        body.removeChild(body.firstChild);
    }
    body.scrollTop = body.scrollHeight;
}

function setRunning(running, text) {
    app.running = running;
    byId("statusbar").classList.toggle("running", running);
    byId("sb-run").innerHTML = running ? "<span class=\"spin\"></span>Running script" : text || "";
}

function receiveOutput(message) {
    var kind = message.kind;
    var data = null;
    if (/^(file-opened|folder-opened|file-saved|bridge-error|devices|report|audit|shell-result|shell-log|shell-cli|debug-trace|reachability|snapshots|snapshot-diff|plugins)$/.test(kind)) {
        try {
            data = JSON.parse(message.text);
        } catch (error) {
            addOutput("error", "Bad message from Packet Tracer: " + kind);
            return;
        }
    }
    if (/^shell-/.test(kind)) {
        if (data.id === "debug-console") {
            receiveConsoleShell(kind, data);
        } else {
            routeShellMessage(kind, data);
        }
        return;
    }
    if (kind === "debug-trace") {
        receiveDebugTrace(data);
        return;
    }
    if (kind === "reachability") {
        receiveReachability(data);
        return;
    }
    if (kind === "plugins") {
        receivePlugins(data);
        return;
    }
    if (kind === "snapshots") {
        app.snapshots = data;
        renderSnapshots();
        return;
    }
    if (kind === "snapshot-diff") {
        receiveSnapshotDiff(data);
        return;
    }
    if (debugState.session && (kind === "log" || kind === "result")) {
        debugState.session.output.push(message.text);
    }
    if (kind === "file-opened") {
        openDiskFile(data.path, data.name, data.text, "disk");
        notify("info", "Opened " + data.path);
    } else if (kind === "folder-opened") {
        app.folder = data;
        showView("explorer");
        renderExplorer();
        persist();
    } else if (kind === "file-saved") {
        fileSaved(data);
    } else if (kind === "bridge-error") {
        addOutput("error", data.action + ": " + data.message);
        notify("error", data.message);
        if (data.action === "reachability") {
            setRunning(false, "");
            if (viewTabs["v-reach"]) {
                viewTabs["v-reach"].running = false;
                renderReachability(viewTabs["v-reach"]);
            }
        }
    } else if (kind === "devices") {
        app.devices = data;
        renderDevices();
    } else if (kind === "report" || kind === "audit") {
        app.reports.unshift({ kind: kind, data: data, time: timeNow() });
        app.reports = app.reports.slice(0, 20);
        renderChecks();
        showPanel("checks");
        setRunning(false, "");
    } else if (kind === "script") {
        newFile("from-cli.js", message.text);
        notify("info", "Created a script from the command log");
    } else {
        addOutput(kind, message.text);
        if (kind === "error") {
            setRunning(false, "");
            byId("sb-run").innerHTML = icon("error") + "Failed";
            if (app.panelTab !== "output") {
                showPanel("output");
            }
        } else if (kind === "done") {
            setRunning(false, icon("checks") + message.text);
        }
    }
}

function fileSaved(data) {
    var file = app.files[data.id];
    if (!file) {
        return;
    }
    var savedText = app.pendingSaves[data.id];
    delete app.pendingSaves[data.id];
    file.path = data.path;
    file.name = data.name;
    file.source = "disk";
    file.saved = savedText === undefined ? file.text : savedText;
    renderTabs();
    renderExplorer();
    renderBreadcrumbs();
    persist();
    notify("info", "Saved " + data.path);
    if (file.closeAfterSave && !isDirty(file)) {
        file.closeAfterSave = false;
        closeTab(file.id, true);
    }
}

function saveFile(id) {
    var file = app.files[id || app.active];
    if (!file) {
        return;
    }
    if (file.source === "workspace") {
        file.saved = file.text;
        persistNow();
        renderTabs();
        renderExplorer();
        if (file.closeAfterSave) {
            closeTab(file.id, true);
        }
        return;
    }
    if (file.source === "disk" && inPacketTracer) {
        app.pendingSaves[file.id] = file.text;
        callEngine("editorSaveFile", file.id, file.path, file.text);
        return;
    }
    downloadText(file.name, file.text);
    file.saved = file.text;
    renderTabs();
    renderExplorer();
    persist();
    if (file.closeAfterSave) {
        closeTab(file.id, true);
    }
}

function saveFileAs(id) {
    var file = app.files[id || app.active];
    if (!file) {
        return;
    }
    if (inPacketTracer) {
        app.pendingSaves[file.id] = file.text;
        callEngine("editorSaveFileAs", file.id, file.name, file.text);
        return;
    }
    showDialog({ title: "Save As", message: "File name", input: file.name, buttons: ["Download", "Cancel"] }, function (choice, value) {
        if (choice === 0 && value) {
            downloadText(value, file.text);
        }
    });
}

function saveAll() {
    app.order.slice().forEach(function (id) {
        if (isDirty(app.files[id])) {
            saveFile(id);
        }
    });
}

function downloadText(name, text) {
    var blob = new Blob([text], { type: "text/javascript" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 500);
}

function pickBrowserFiles(folder) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.txt,.json,.md,.cfg";
    input.multiple = true;
    if (folder) {
        input.setAttribute("webkitdirectory", "");
    }
    input.onchange = function () {
        var list = Array.prototype.slice.call(input.files || []);
        if (folder) {
            list = list.filter(function (f) {
                return /\.(js|txt|json|md|cfg)$/i.test(f.name);
            });
        }
        readBrowserFiles(list, function (entries) {
            if (folder) {
                var root = entries.length ? (entries[0].path.split("/")[0] || "folder") : "folder";
                app.browserFolder = {};
                entries.forEach(function (e) {
                    app.browserFolder[e.path] = e.text;
                });
                app.folder = { name: root, path: "browser:" + root, files: entries.map(function (e) {
                    return { name: e.path.split("/").slice(1).join("/") || e.name, path: e.path };
                }) };
                showView("explorer");
                renderExplorer();
                persist();
            } else {
                entries.forEach(function (e) {
                    openDiskFile("browser:" + e.name, e.name, e.text, "browser");
                });
            }
        });
    };
    input.click();
}

function readBrowserFiles(list, done) {
    var results = [];
    var pending = list.length;
    if (!pending) {
        done(results);
        return;
    }
    list.forEach(function (file, index) {
        var reader = new FileReader();
        reader.onload = function () {
            results[index] = { name: file.name, path: file.webkitRelativePath || file.name, text: String(reader.result).replace(/\r\n?/g, "\n") };
            pending--;
            if (!pending) {
                done(results);
            }
        };
        reader.readAsText(file);
    });
}

function openFileCommand() {
    if (!callEngine("editorOpenFile")) {
        pickBrowserFiles(false);
    }
}

function openFolderCommand() {
    if (!callEngine("editorOpenFolder")) {
        pickBrowserFiles(true);
    }
}

function openFolderEntry(path) {
    var existing = findFileByPath(path);
    if (existing) {
        openTab(existing.id);
        return;
    }
    if (path.indexOf("browser:") !== 0 && inPacketTracer) {
        callEngine("editorReadFile", path);
        return;
    }
    var text = app.browserFolder[path];
    if (text === undefined) {
        notify("warning", "Open the folder again to read this file");
        return;
    }
    openDiskFile(path, path.split("/").pop(), text, "browser");
}

function refreshFolder() {
    if (app.folder && inPacketTracer && app.folder.path.indexOf("browser:") !== 0) {
        callEngine("editorListFolder", app.folder.path);
    }
}

function renameFile(id) {
    var file = app.files[id];
    if (!file || file.source !== "workspace") {
        return;
    }
    showDialog({ title: "Rename", message: "New name for " + file.name, input: file.name, buttons: ["Rename", "Cancel"] }, function (choice, value) {
        var name = String(value || "").trim();
        if (choice !== 0 || !name || name === file.name) {
            return;
        }
        file.name = uniqueName(/\.[A-Za-z0-9]+$/.test(name) ? name : name + ".js");
        renderTabs();
        renderExplorer();
        renderBreadcrumbs();
        persist();
    });
}

function deleteFile(id) {
    var file = app.files[id];
    if (!file) {
        return;
    }
    showDialog({ title: "Delete " + file.name + "?", message: "The file is removed from the PTForge workspace. This cannot be undone.", buttons: ["Delete", "Cancel"], danger: true }, function (choice) {
        if (choice !== 0) {
            return;
        }
        file.source = "gone";
        closeTab(id, true);
        if (app.files[id]) {
            delete app.files[id];
            app.order.splice(app.order.indexOf(id), 1);
        }
        renderExplorer();
        persist();
    });
}

function renderExplorer() {
    var view = byId("view-explorer");
    if (!view) {
        return;
    }
    var workspaceFiles = app.order.filter(function (id) {
        return app.files[id].source === "workspace";
    });
    var html = [];
    html.push(sectionHead("open", "Open Editors", ""));
    html.push("<div class=\"section-body\" data-body=\"open\">" + (app.open.length ? app.open.map(function (id) {
        var info = tabInfo(id);
        return "<div class=\"tree-row" + (id === app.active ? " selected" : "") + "\" data-open=\"" + id + "\"><span class=\"row-close\" data-close=\"" + id + "\">" + icon("close") + "</span>" + info.icon +
            "<span class=\"row-name\">" + escapeHtml(info.name) + "</span>" + (info.dirty ? "<span class=\"dot\"></span>" : "") + "</div>";
    }).join("") : "<div class=\"tree-empty\">No open editors</div>") + "</div>");
    html.push(sectionHead("workspace", "Workspace", "<span class=\"sec-act\" data-cmd=\"file.new\" title=\"New File (Ctrl+N)\">" + icon("newFile") + "</span>"));
    html.push("<div class=\"section-body\" data-body=\"workspace\">" + workspaceFiles.map(function (id) {
        var f = app.files[id];
        return "<div class=\"tree-row" + (id === app.active ? " selected" : "") + "\" data-open=\"" + id + "\">" + fileIcon(f.name) + "<span class=\"row-name\">" + escapeHtml(f.name) +
            "</span>" + (isDirty(f) ? "<span class=\"dot\"></span>" : "") + "<span class=\"row-acts\"><span data-rename=\"" + id + "\" title=\"Rename (F2)\">" + icon("edit") +
            "</span><span data-delete=\"" + id + "\" title=\"Delete\">" + icon("trash") + "</span></span></div>";
    }).join("") + (workspaceFiles.length ? "" : "<div class=\"tree-empty\">The workspace is empty. <a data-cmd=\"file.new\">Create a file</a></div>") + "</div>");
    if (app.folder) {
        html.push(sectionHead("folder", app.folder.name, "<span class=\"sec-act\" data-cmd=\"folder.refresh\" title=\"Refresh\">" + icon("refresh") + "</span><span class=\"sec-act\" data-cmd=\"folder.close\" title=\"Close Folder\">" + icon("close") + "</span>"));
        html.push("<div class=\"section-body\" data-body=\"folder\">" + app.folder.files.map(function (entry) {
            var open = findFileByPath(entry.path);
            return "<div class=\"tree-row" + (open && open.id === app.active ? " selected" : "") + "\" data-path=\"" + escapeHtml(entry.path) + "\">" + fileIcon(entry.name) + "<span class=\"row-name\">" + escapeHtml(entry.name) + "</span></div>";
        }).join("") + (app.folder.files.length ? "" : "<div class=\"tree-empty\">No script files in this folder</div>") + "</div>");
    } else {
        html.push(sectionHead("folder", "No Folder Opened", ""));
        html.push("<div class=\"section-body\" data-body=\"folder\"><div class=\"tree-hint\">Open a folder of scripts from your computer.</div><button class=\"btn primary block\" data-cmd=\"folder.open\">Open Folder</button><button class=\"btn block\" data-cmd=\"file.open\">Open File</button></div>");
    }
    view.querySelector(".view-body").innerHTML = html.join("");
    (app.collapsed || []).forEach(function (name) {
        var head = view.querySelector("[data-section=\"" + name + "\"]");
        if (head) {
            head.classList.add("collapsed");
        }
    });
}

function sectionHead(name, title, actions) {
    return "<div class=\"section-head\" data-section=\"" + name + "\">" + icon("chevron", "twisty") + "<span class=\"sec-title\">" + escapeHtml(title) + "</span><span class=\"sec-acts\">" + actions + "</span></div>";
}

function renderFunctions() {
    var query = byId("fn-search").value.trim().toLowerCase();
    var groups = {};
    var order = [];
    functionCatalog.forEach(function (fn) {
        var hay = (fn.name + " " + fn.info + " " + fn.area).toLowerCase();
        if (query && hay.indexOf(query) === -1) {
            return;
        }
        if (!groups[fn.area]) {
            groups[fn.area] = [];
            order.push(fn.area);
        }
        groups[fn.area].push(fn);
    });
    var total = 0;
    byId("fn-list").innerHTML = order.map(function (area) {
        total += groups[area].length;
        return "<div class=\"section-head" + (query ? "" : " collapsed") + "\" data-section=\"fn-" + escapeHtml(area) + "\">" + icon("chevron", "twisty") + "<span class=\"sec-title\">" + escapeHtml(area) +
            "</span><span class=\"count\">" + groups[area].length + "</span></div><div class=\"section-body\">" + groups[area].map(function (fn) {
                return "<div class=\"fn-row\" data-insert=\"" + fn.name + "\" title=\"" + escapeHtml(fn.info) + "\"><div class=\"fn-sig\"><span class=\"tk-api\">" + fn.name + "</span><span class=\"fn-args\">(" + escapeHtml(fn.args) + ")</span></div><div class=\"fn-info\">" + escapeHtml(fn.info) + "</div></div>";
            }).join("") + "</div>";
    }).join("") || "<div class=\"tree-empty\">No functions match</div>";
    byId("fn-count").textContent = total + " of " + functionCatalog.length;
}

function renderSnippets() {
    byId("snippet-list").innerHTML = snippets.map(function (s, i) {
        return "<div class=\"snip\" data-snippet=\"" + i + "\"><div class=\"snip-name\">" + icon("snippets") + escapeHtml(s.name) + "</div><div class=\"snip-info\">" + escapeHtml(s.info) +
            "</div><div class=\"snip-acts\"><button class=\"btn small\" data-snippet-insert=\"" + i + "\">Insert</button><button class=\"btn small\" data-snippet-new=\"" + i + "\">Open as file</button></div></div>";
    }).join("");
}

function deviceIcon(type) {
    if (/router/.test(type) && !/wireless/.test(type)) {
        return icon("router", "dev-router");
    }
    if (/switch|hub|bridge/.test(type)) {
        return icon("switch", "dev-switch");
    }
    if (/server/.test(type)) {
        return icon("server", "dev-server");
    }
    if (/cloud|remote|modem/.test(type)) {
        return icon("cloud", "dev-cloud");
    }
    if (/wireless|accesspoint/.test(type)) {
        return icon("wireless", "dev-wireless");
    }
    return icon("pc", "dev-pc");
}

function renderDevices() {
    var body = byId("device-list");
    if (!inPacketTracer && !app.devices) {
        body.innerHTML = "<div class=\"tree-hint\">The device list is read live from Packet Tracer. Open PTForge inside Packet Tracer to use it.</div>";
        return;
    }
    if (!app.devices) {
        body.innerHTML = "<div class=\"tree-hint\">Loading devices...</div>";
        return;
    }
    var filter = byId("dev-search").value.trim().toLowerCase();
    var list = app.devices.devices.filter(function (d) {
        return !filter || (d.name + " " + d.type + " " + d.model).toLowerCase().indexOf(filter) !== -1;
    });
    byId("dev-count").textContent = app.devices.devices.length + " devices, " + app.devices.links + " links";
    body.innerHTML = list.map(function (d) {
        return "<div class=\"section-head collapsed dev-head\" data-section=\"dev-" + escapeHtml(d.name) + "\">" + icon("chevron", "twisty") + deviceIcon(d.type) +
            "<span class=\"sec-title dev-name\" data-device=\"" + escapeHtml(d.name) + "\">" + escapeHtml(d.name) + "</span><span class=\"dev-model\">" + escapeHtml(d.model) + "</span></div>" +
            "<div class=\"section-body\">" + (d.ports.length ? d.ports.map(function (p) {
                return "<div class=\"port-row\" data-port=\"" + escapeHtml(p.name) + "\"><span class=\"led " + (p.up ? "up" : "down") + "\"></span><span class=\"port-name\">" + escapeHtml(p.name) +
                    "</span><span class=\"port-ip\">" + escapeHtml(p.ip) + "</span></div>";
            }).join("") : "<div class=\"tree-empty\">No cabled or addressed ports</div>") + "</div>";
    }).join("") || "<div class=\"tree-empty\">No devices</div>";
}

function refreshDevices() {
    if (!callEngine("editorDevices")) {
        renderDevices();
    }
}

function renderChecks() {
    var body = byId("panel-checks");
    if (!app.reports.length) {
        body.innerHTML = "<div class=\"empty\">Run <code>endChecks()</code> or <code>auditNetwork()</code> to see a report here. <a data-cmd=\"snippet.labcheck\">Insert a Lab Check template</a></div>";
        return;
    }
    body.innerHTML = app.reports.map(function (r) {
        if (r.kind === "report") {
            var d = r.data;
            var grade = d.percent >= 90 ? "good" : d.percent >= 60 ? "ok" : "bad";
            return "<div class=\"report\"><div class=\"report-head\"><div class=\"score " + grade + "\" style=\"--p:" + d.percent + "\"><span>" + d.percent + "%</span></div><div><div class=\"report-title\">" + escapeHtml(d.title) +
                "</div><div class=\"report-sub\">" + d.passed + " of " + d.total + " checks passed, score " + d.score + "/" + d.maxScore + " at " + r.time + "</div></div></div>" +
                d.items.map(function (item) {
                    return "<div class=\"check-row " + (item.passed ? "pass" : "fail") + "\">" + icon(item.passed ? "checks" : "error") + "<span class=\"check-name\">" + escapeHtml(item.name) +
                        "</span><span class=\"check-pts\">" + (item.passed ? item.points : 0) + "/" + item.points + "</span>" + (item.hint ? "<div class=\"check-hint\">" + escapeHtml(item.hint) + "</div>" : "") + "</div>";
                }).join("") + "</div>";
        }
        var a = r.data;
        return "<div class=\"report\"><div class=\"report-head\"><div class=\"audit-badges\"><span class=\"b-err\">" + icon("error") + a.errors + "</span><span class=\"b-warn\">" + icon("warning") + a.warnings +
            "</span><span class=\"b-info\">" + icon("info") + a.infos + "</span></div><div><div class=\"report-title\">Network audit</div><div class=\"report-sub\">" + a.findings.length + " findings at " + r.time + "</div></div></div>" +
            (a.findings.length ? a.findings.map(function (f) {
                return "<div class=\"check-row sev-row-" + f.severity + "\">" + icon(f.severity, "sev-" + f.severity) + "<span class=\"check-name\"><b>" + escapeHtml(f.device) + (f.port ? " " + escapeHtml(f.port) : "") + "</b> " + escapeHtml(f.message) + "</span><span class=\"check-pts rule\">" + f.rule + "</span></div>";
            }).join("") : "<div class=\"check-row pass\">" + icon("checks") + "<span class=\"check-name\">No issues found</span></div>") + "</div>";
    }).join("");
}

function calcRow(label, value) {
    return "<tr><th>" + label + "</th><td><span class=\"copyable\" title=\"Click to copy\">" + escapeHtml(String(value)) + "</span></td></tr>";
}

function runSubnetCalc() {
    var out = byId("calc-subnet-out");
    var value = byId("calc-subnet").value;
    if (!value.trim()) {
        out.innerHTML = "";
        return;
    }
    try {
        var s = subnetInfo(value);
        out.innerHTML = "<table class=\"calc\">" + calcRow("Network", s.network + "/" + s.prefix) + calcRow("Mask", s.mask) + calcRow("Wildcard", s.wildcard) + calcRow("Broadcast", s.broadcast) +
            calcRow("Host range", s.firstHost + " - " + s.lastHost) + calcRow("Usable hosts", s.hosts) + calcRow("Class", s.ipClass + ", " + s.scope) + calcRow("Binary mask", s.binaryMask) + "</table>";
    } catch (error) {
        out.innerHTML = "<div class=\"calc-error\">" + escapeHtml(error.message) + "</div>";
    }
}

function runVlsmCalc() {
    var out = byId("calc-vlsm-out");
    var base = byId("calc-vlsm-base").value;
    var list = byId("calc-vlsm-list").value;
    if (!base.trim() || !list.trim()) {
        out.innerHTML = "";
        return;
    }
    try {
        var plan = vlsmPlan(base, parseVlsmRequests(list));
        app.lastPlan = plan;
        out.innerHTML = "<table class=\"calc grid\"><tr><th>Name</th><th>Network</th><th>Range</th><th>Hosts</th></tr>" + plan.map(function (p) {
            return "<tr><td>" + escapeHtml(p.name) + "</td><td><span class=\"copyable\">" + p.network + "</span></td><td class=\"small\">" + p.range + "</td><td>" + p.needed + "/" + p.hosts + "</td></tr>";
        }).join("") + "</table><button class=\"btn small\" data-cmd=\"tools.insertPlan\">Insert as comment</button>";
    } catch (error) {
        app.lastPlan = null;
        out.innerHTML = "<div class=\"calc-error\">" + escapeHtml(error.message) + "</div>";
    }
}

function runWildcardCalc() {
    var out = byId("calc-wild-out");
    var value = byId("calc-wild").value;
    if (!value.trim()) {
        out.innerHTML = "";
        return;
    }
    try {
        var w = wildcardFor(value);
        out.innerHTML = "<table class=\"calc\">" + calcRow("Prefix", "/" + w.prefix) + calcRow("Mask", w.mask) + calcRow("Wildcard", w.wildcard) + "</table>";
    } catch (error) {
        out.innerHTML = "<div class=\"calc-error\">" + escapeHtml(error.message) + "</div>";
    }
}

function insertPlanComment() {
    if (!app.lastPlan) {
        return;
    }
    var lines = app.lastPlan.map(function (p) {
        return "// " + p.name + ": " + p.network + "  hosts " + p.range + "  (" + p.needed + " needed)";
    });
    insertIntoEditor(lines.join("\n") + "\n");
}

function copyText(text) {
    if (!callEngine("editorCopy", text)) {
        try {
            navigator.clipboard.writeText(text);
        } catch (error) {
            return;
        }
    }
    notify("info", "Copied " + (text.length > 40 ? text.substring(0, 40) + "..." : text));
}

function insertIntoEditor(text) {
    var editor = activeEditor();
    if (!editor) {
        newFile("untitled.js", text);
        return;
    }
    editor.focus();
    editor.insert(text);
}

function showView(name) {
    if (!byId("view-" + name)) {
        name = "explorer";
    }
    if (app.view === name && app.sidebarVisible && arguments[1] === true) {
        app.sidebarVisible = false;
    } else {
        app.view = name;
        app.sidebarVisible = true;
    }
    layout();
    if (name === "plugins" && !app.plugins) {
        refreshPlugins();
    }
    if (name === "devices" && !app.devices) {
        refreshDevices();
    }
    if (name === "devices" && !app.snapshotsLoaded) {
        app.snapshotsLoaded = callEngine("editorSnapshot", "list");
    }
    if (name === "debug") {
        renderDebugView();
    }
    if (name === "search") {
        setTimeout(function () {
            byId("fn-search").focus();
        }, 0);
    }
    persist();
}

function showPanel(name) {
    if (!byId("panel-" + name)) {
        name = "output";
    }
    app.panelTab = name;
    app.panelVisible = true;
    layout();
    if (name === "terminal") {
        if (!terminalState.list.length) {
            createTerminal("js");
        } else {
            var term = activeTerminal();
            if (term) {
                term.scrollDown();
                term.focus();
            }
        }
    }
    if (name === "debug") {
        setTimeout(function () {
            var input = byId("debug-console-input");
            if (input && !debugState.session) {
                input.focus();
            }
        }, 0);
    }
    persist();
}

var panelActions = {
    terminal: [["terminal.new", "add", "New Terminal (Ctrl+Shift+`)"], ["terminal.profiles", "chevronDown", "Launch Profile..."], ["terminal.kill", "trash", "Kill Terminal"]],
    output: [["output.clear", "clear", "Clear Output"]],
    debug: [["debug.clearConsole", "clear", "Clear Console"]],
    checks: [["checks.clear", "clear", "Clear Reports"]],
    problems: []
};

function renderPanelActions() {
    var box = byId("panel-actions");
    if (!box) {
        return;
    }
    var list = panelActions[app.panelTab] || [];
    box.innerHTML = (app.panelTab === "terminal" ? "<span class=\"pa-label\" id=\"term-title\"></span>" : "") + list.map(function (a) {
        return "<span class=\"pa\" data-cmd=\"" + a[0] + "\" title=\"" + escapeHtml(a[2]) + "\">" + icon(a[1]) + "</span>";
    }).join("") + (list.length ? "<span class=\"pa-sep\"></span>" : "") +
        "<span class=\"pa\" data-cmd=\"view.panelMax\" title=\"" + (app.panelMax ? "Restore Panel Size" : "Maximize Panel Size") + "\">" + icon(app.panelMax ? "chevronDown" : "chevronUp") + "</span>" +
        "<span class=\"pa\" data-cmd=\"view.panel\" title=\"Hide Panel (Ctrl+J)\">" + icon("close") + "</span>";
    if (app.panelTab === "terminal") {
        renderTerminalTabs();
    }
}

function layout() {
    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) {
        views[i].classList.toggle("hidden", views[i].id !== "view-" + app.view);
    }
    var acts = document.querySelectorAll(".act[data-view]");
    for (var j = 0; j < acts.length; j++) {
        acts[j].classList.toggle("active", app.sidebarVisible && acts[j].getAttribute("data-view") === app.view);
    }
    byId("sidebar").classList.toggle("hidden", !app.sidebarVisible);
    byId("sash-side").classList.toggle("hidden", !app.sidebarVisible);
    byId("sidebar").style.width = app.sidebarWidth + "px";
    byId("panel").classList.toggle("hidden", !app.panelVisible);
    byId("sash-panel").classList.toggle("hidden", !app.panelVisible);
    byId("panel").style.height = (app.panelMax ? Math.max(120, window.innerHeight - 140) : app.panelHeight) + "px";
    var tabs = document.querySelectorAll(".panel-tab");
    for (var k = 0; k < tabs.length; k++) {
        tabs[k].classList.toggle("active", tabs[k].getAttribute("data-panel") === app.panelTab);
    }
    var bodies = document.querySelectorAll(".panel-body");
    for (var m = 0; m < bodies.length; m++) {
        bodies[m].classList.toggle("hidden", bodies[m].id !== "panel-" + app.panelTab);
    }
    renderPanelActions();
    var editor = activeEditor();
    if (editor) {
        editor.render();
    }
}

function setFontSize(size) {
    app.fontSize = Math.max(9, Math.min(28, size));
    Object.keys(app.editors).forEach(function (id) {
        app.editors[id].setFontSize(app.fontSize);
    });
    byId("sb-zoom").textContent = app.fontSize + "px";
    persist();
}

function runActive(selectionOnly) {
    var editor = activeEditor();
    if (debugState.session && !selectionOnly) {
        notify("info", "A debug session is active. Stop it with Shift+F5 first.");
        return;
    }
    if (!editor) {
        notify("warning", "Open a script first");
        return;
    }
    var code = selectionOnly ? editor.selectedText() : editor.getValue();
    if (!code.trim()) {
        notify("warning", selectionOnly ? "Select some code to run" : "The script is empty");
        return;
    }
    var label = selectionOnly ? "selection" : activeFile().name;
    if (!sendScript(code)) {
        addOutput("warn", "Preview mode: scripts run only inside Packet Tracer. Open this window from Extensions > PTForge.");
        showPanel("output");
        return;
    }
    addOutput("run", "Running " + label + " (" + code.split("\n").length + " lines)");
    setRunning(true);
    if (app.panelTab !== "checks") {
        showPanel("output");
    }
}

function runCode(code, label) {
    if (!sendScript(code)) {
        addOutput("warn", "Preview mode: " + label + " needs Packet Tracer.");
        showPanel("output");
        return;
    }
    addOutput("run", label);
    setRunning(true);
}

var commands = [
    { id: "file.new", title: "New File", category: "File", key: "Ctrl+N", run: function () { newFile(); } },
    { id: "file.open", title: "Open File...", category: "File", key: "Ctrl+O", run: openFileCommand },
    { id: "folder.open", title: "Open Folder...", category: "File", key: "Ctrl+K Ctrl+O", run: openFolderCommand },
    { id: "file.save", title: "Save", category: "File", key: "Ctrl+S", run: function () { saveFile(); } },
    { id: "file.saveAs", title: "Save As...", category: "File", key: "Ctrl+Shift+S", run: function () { saveFileAs(); } },
    { id: "file.saveAll", title: "Save All", category: "File", key: "Ctrl+Alt+S", run: saveAll },
    { id: "file.download", title: "Export (Download) Current File", category: "File", run: function () { var f = activeFile(); if (f) { downloadText(f.name, f.text); } } },
    { id: "file.importClipboard", title: "Import from Clipboard as New File", category: "File", run: importClipboard },
    { id: "file.rename", title: "Rename File", category: "File", key: "F2", run: function () { renameFile(app.active); } },
    { id: "file.close", title: "Close Editor", category: "View", key: "Ctrl+W", run: function () { if (app.active) { closeTab(app.active); } } },
    { id: "file.closeAll", title: "Close All Editors", category: "View", run: function () { app.open.slice().forEach(function (id) { closeTab(id); }); } },
    { id: "folder.refresh", title: "Refresh Folder", category: "File", run: refreshFolder },
    { id: "folder.close", title: "Close Folder", category: "File", run: function () { app.folder = null; renderExplorer(); persist(); } },
    { id: "edit.undo", title: "Undo", category: "Edit", key: "Ctrl+Z", run: function () { var e = activeEditor(); if (e) { e.focus(); document.execCommand("undo"); } } },
    { id: "edit.redo", title: "Redo", category: "Edit", key: "Ctrl+Y", run: function () { var e = activeEditor(); if (e) { e.focus(); document.execCommand("redo"); } } },
    { id: "edit.find", title: "Find", category: "Edit", key: "Ctrl+F", run: function () { openFind(false); } },
    { id: "edit.replace", title: "Replace", category: "Edit", key: "Ctrl+H", run: function () { openFind(true); } },
    { id: "edit.comment", title: "Toggle Line Comment", category: "Edit", key: "Ctrl+/", run: function () { var e = activeEditor(); if (e) { e.toggleComment(); } } },
    { id: "edit.selectAll", title: "Select All", category: "Selection", key: "Ctrl+A", run: function () { var e = activeEditor(); if (e) { e.focus(); e.input.select(); } } },
    { id: "edit.moveUp", title: "Move Line Up", category: "Selection", key: "Alt+Up", run: function () { var e = activeEditor(); if (e) { e.moveLines(-1); } } },
    { id: "edit.moveDown", title: "Move Line Down", category: "Selection", key: "Alt+Down", run: function () { var e = activeEditor(); if (e) { e.moveLines(1); } } },
    { id: "edit.copyDown", title: "Copy Line Down", category: "Selection", key: "Shift+Alt+Down", run: function () { var e = activeEditor(); if (e) { e.moveLines(1, true); } } },
    { id: "edit.deleteLine", title: "Delete Line", category: "Edit", key: "Ctrl+Shift+K", run: function () { var e = activeEditor(); if (e) { e.deleteLines(); } } },
    { id: "edit.copyAll", title: "Copy Whole File", category: "Edit", run: function () { var f = activeFile(); if (f) { copyText(f.text); } } },
    { id: "edit.suggest", title: "Trigger Suggest", category: "Edit", key: "Ctrl+Space", run: function () { var e = activeEditor(); if (e) { e.focus(); e.openSuggest(true); } } },
    { id: "go.line", title: "Go to Line...", category: "Go", key: "Ctrl+G", run: function () { openPalette(":"); } },
    { id: "go.file", title: "Go to File...", category: "Go", key: "Ctrl+P", run: function () { openPalette(""); } },
    { id: "go.nextTab", title: "Next Editor", category: "View", key: "Ctrl+Tab", run: function () { cycleTab(1); } },
    { id: "go.prevTab", title: "Previous Editor", category: "View", key: "Ctrl+Shift+Tab", run: function () { cycleTab(-1); } },
    { id: "go.nextProblem", title: "Go to Next Problem", category: "Go", key: "F8", run: nextProblem },
    { id: "view.palette", title: "Show All Commands", category: "View", key: "Ctrl+Shift+P", run: function () { openPalette(">"); } },
    { id: "view.explorer", title: "Show Explorer", category: "View", key: "Ctrl+Shift+E", run: function () { showView("explorer"); } },
    { id: "view.functions", title: "Show Function Reference", category: "View", key: "Ctrl+Shift+F", run: function () { showView("search"); } },
    { id: "view.snippets", title: "Show Snippets", category: "View", run: function () { showView("snippets"); } },
    { id: "view.devices", title: "Show Devices", category: "View", run: function () { showView("devices"); } },
    { id: "view.tools", title: "Show Network Tools", category: "View", key: "Ctrl+Shift+T", run: function () { showView("tools"); } },
    { id: "view.plugins", title: "Show Plugins", category: "View", key: "Ctrl+Shift+X", run: function () { showView("plugins"); } },
    { id: "view.sidebar", title: "Toggle Primary Side Bar", category: "View", key: "Ctrl+B", run: function () { app.sidebarVisible = !app.sidebarVisible; layout(); persist(); } },
    { id: "view.panel", title: "Toggle Panel", category: "View", key: "Ctrl+J", run: function () { app.panelVisible = !app.panelVisible; layout(); persist(); } },
    { id: "view.problems", title: "Show Problems", category: "View", key: "Ctrl+Shift+M", run: function () { showPanel("problems"); } },
    { id: "view.output", title: "Show Output", category: "View", key: "Ctrl+Shift+U", run: function () { showPanel("output"); } },
    { id: "view.checks", title: "Show Lab Check Reports", category: "View", run: function () { showPanel("checks"); } },
    { id: "view.zoomIn", title: "Zoom In", category: "View", key: "Ctrl+=", run: function () { setFontSize(app.fontSize + 1); } },
    { id: "view.zoomOut", title: "Zoom Out", category: "View", key: "Ctrl+-", run: function () { setFontSize(app.fontSize - 1); } },
    { id: "view.zoomReset", title: "Reset Zoom", category: "View", key: "Ctrl+0", run: function () { setFontSize(14); } },
    { id: "output.clear", title: "Clear Output", category: "View", run: function () { byId("panel-output").innerHTML = ""; } },
    { id: "run.script", title: "Run Without Debugging", category: "Run", key: "Ctrl+F5", run: function () { runActive(false); } },
    { id: "run.selection", title: "Run Selection", category: "Run", key: "Ctrl+Shift+Enter", run: function () { runActive(true); } },
    { id: "debug.start", title: "Start Debugging", category: "Debug", key: "F5", run: startDebugging },
    { id: "debug.continue", title: "Continue", category: "Debug", key: "F5", run: debugContinue },
    { id: "debug.stop", title: "Stop Debugging", category: "Debug", key: "Shift+F5", run: stopDebugging },
    { id: "debug.restart", title: "Restart Debugging", category: "Debug", key: "Ctrl+Shift+F5", run: restartDebugging },
    { id: "debug.stepOver", title: "Step Over", category: "Debug", key: "F10", run: function () { debugMove("over"); } },
    { id: "debug.stepInto", title: "Step Into", category: "Debug", key: "F11", run: function () { debugMove("into"); } },
    { id: "debug.stepOut", title: "Step Out", category: "Debug", key: "Shift+F11", run: function () { debugMove("out"); } },
    { id: "debug.stepBack", title: "Step Back", category: "Debug", key: "Shift+F10", run: function () { debugMove("back"); } },
    { id: "debug.reverse", title: "Reverse Continue", category: "Debug", run: function () { debugMove("reverse"); } },
    { id: "debug.toggleBreakpoint", title: "Toggle Breakpoint", category: "Debug", key: "F9", run: toggleBreakpointAtCursor },
    { id: "debug.conditional", title: "Add Conditional Breakpoint...", category: "Debug", run: function () { var f = activeFile(); var e = activeEditor(); if (f && e) { editBreakpoint(f.id, e.lineColumn().line, "condition"); } } },
    { id: "debug.logpoint", title: "Add Logpoint...", category: "Debug", run: function () { var f = activeFile(); var e = activeEditor(); if (f && e) { editBreakpoint(f.id, e.lineColumn().line, "log"); } } },
    { id: "debug.enableAll", title: "Enable All Breakpoints", category: "Debug", run: function () { setAllBreakpoints(true); } },
    { id: "debug.disableAll", title: "Disable All Breakpoints", category: "Debug", run: function () { setAllBreakpoints(false); } },
    { id: "debug.toggleActive", title: "Toggle Activate Breakpoints", category: "Debug", run: toggleBreakpointsActive },
    { id: "debug.removeAll", title: "Remove All Breakpoints", category: "Debug", run: removeAllBreakpoints },
    { id: "debug.addWatch", title: "Add to Watch", category: "Debug", run: function () { var e = activeEditor(); addWatch(e ? e.selectedText().trim() : ""); } },
    { id: "debug.clearConsole", title: "Clear Console", category: "Debug", run: clearDebugConsole },
    { id: "debug.collapse", title: "Collapse All Variables", category: "Debug", run: function () { debugState.expanded = { "scope:0": false }; renderDebugView(); } },
    { id: "debug.removeWatches", title: "Remove All Watch Expressions", category: "Debug", run: function () { debugState.watches = []; renderDebugView(); persist(); } },
    { id: "view.debug", title: "Show Run and Debug", category: "View", key: "Ctrl+Shift+D", run: function () { showView("debug"); } },
    { id: "view.debugConsole", title: "Show Debug Console", category: "View", key: "Ctrl+Shift+Y", run: function () { showPanel("debug"); } },
    { id: "view.panelMax", title: "Toggle Maximized Panel", category: "View", run: function () { app.panelMax = !app.panelMax; app.panelVisible = true; layout(); } },
    { id: "terminal.new", title: "Create New Terminal", category: "Terminal", key: "Ctrl+Shift+`", run: function () { app.panelVisible = true; app.panelTab = "terminal"; layout(); createTerminal("js"); } },
    { id: "terminal.toggle", title: "Toggle Terminal", category: "View", key: "Ctrl+`", run: toggleTerminal },
    { id: "terminal.cli", title: "Create New Device CLI Terminal...", category: "Terminal", run: askCliTerminal },
    { id: "terminal.profiles", title: "Select Terminal Profile", category: "Terminal", run: showTerminalProfiles },
    { id: "terminal.runSelection", title: "Run Selected Text in Active Terminal", category: "Terminal", run: function () { runInTerminal(true); } },
    { id: "terminal.runFile", title: "Run Active File in Active Terminal", category: "Terminal", run: function () { runInTerminal(false); } },
    { id: "terminal.clear", title: "Clear Terminal", category: "Terminal", run: function () { var t = activeTerminal(); if (t) { t.clear(); } } },
    { id: "terminal.kill", title: "Kill the Active Terminal Instance", category: "Terminal", run: function () { killTerminal(); } },
    { id: "net.reach", title: "Reachability Matrix (Ping All)", category: "Network", run: runReachability },
    { id: "net.snapshot", title: "Take Snapshot...", category: "Network", run: takeSnapshotUi },
    { id: "net.compare", title: "Compare Snapshots...", category: "Network", run: compareTwoSnapshotsUi },
    { id: "net.calc", title: "Open Network Calculator", category: "Network", run: function () { openCalculator(); } },
    { id: "plugins.new", title: "New Plugin", category: "Plugins", run: newPluginUi },
    { id: "plugins.reload", title: "Reload Plugins", category: "Plugins", run: function () { if (!callEngine("editorPlugins", "reload")) { notify("warning", "Plugins load only inside Packet Tracer"); } } },
    { id: "plugins.folder", title: "Change Plugin Folder", category: "Plugins", run: function () { if (!callEngine("editorPlugins", "folder")) { notify("warning", "Plugins load only inside Packet Tracer"); } } },
    { id: "plugins.checks", title: "Run Plugin Checks", category: "Plugins", run: function () { if (!sendScript("runPluginChecks();")) { notify("warning", "Plugin checks run only inside Packet Tracer"); } } },
    { id: "checks.clear", title: "Clear Lab Check Reports", category: "View", run: function () { app.reports = []; renderChecks(); } },
    { id: "run.audit", title: "Audit Network", category: "Network", run: function () { runCode("auditNetwork();", "Auditing the network"); } },
    { id: "run.summary", title: "Topology Summary", category: "Network", run: function () { runCode("showResult(getTopologySummary());", "Topology summary"); } },
    { id: "run.inventory", title: "IP Inventory", category: "Network", run: function () { runCode("showResult(getIpInventory());", "IP inventory"); } },
    { id: "run.cliScript", title: "Command Log to Script", category: "Network", run: function () { runCode("if (!commandsToScript()) { log(\"The command log is empty. Turn it on with setCommandLogging(true) and type some IOS commands.\"); }", "Reading the command log"); } },
    { id: "run.showAll", title: "Run a Show Command on All Devices...", category: "Network", run: askShowAll },
    { id: "snippet.labcheck", title: "Insert Lab Check Template", category: "Network", run: function () { insertSnippetByName("Lab check"); } },
    { id: "tools.insertPlan", title: "Insert VLSM Plan as Comment", category: "Network", run: insertPlanComment },
    { id: "help.keys", title: "Keyboard Shortcuts", category: "Help", key: "Ctrl+K Ctrl+S", run: showShortcuts },
    { id: "help.about", title: "About PTForge", category: "Help", run: showAbout }
];

calcTools.forEach(function (tool) {
    commands.push({ id: "calc." + tool.id, title: "Network Calculator: " + tool.title, category: "Network", run: function () { openCalculator(tool.id); } });
});

var commandIndex = {};
commands.forEach(function (c) {
    commandIndex[c.id] = c;
});

function toggleTerminal() {
    if (app.panelVisible && app.panelTab === "terminal") {
        var term = activeTerminal();
        if (term && document.activeElement === term.input) {
            app.panelVisible = false;
            layout();
            var editor = activeEditor();
            if (editor) {
                editor.focus();
            }
            persist();
            return;
        }
    }
    showPanel("terminal");
}

function deviceNames(filter) {
    return ((app.devices && app.devices.devices) || []).filter(function (d) {
        return !filter || filter(d);
    }).map(function (d) {
        return d.name;
    });
}

function askCliTerminal() {
    var names = deviceNames(function (d) { return /router|switch|multilayer|firewall|asa/i.test(d.type); });
    showDialog({ title: "Device CLI terminal", message: names.length ? "Device name. Routers and switches: " + names.join(", ") : "Device name, for example R1", input: names[0] || "R1", buttons: ["Open", "Cancel"] }, function (choice, value) {
        if (choice === 0 && value && value.trim()) {
            app.panelVisible = true;
            app.panelTab = "terminal";
            layout();
            createTerminal("cli", value.trim());
        }
    });
}

function showTerminalProfiles() {
    var button = document.querySelector("[data-cmd=\"terminal.profiles\"]");
    var box = button ? button.getBoundingClientRect() : { left: 200, bottom: 200 };
    var items = [
        { label: "JavaScript Shell", run: function () { runCommandId("terminal.new"); } },
        { label: "Device CLI...", run: askCliTerminal }
    ];
    var names = deviceNames(function (d) { return /router|switch|multilayer/i.test(d.type); }).slice(0, 12);
    if (names.length) {
        items.push({ separator: true });
        names.forEach(function (name) {
            items.push({ label: name + " CLI", run: function () { app.panelVisible = true; app.panelTab = "terminal"; layout(); createTerminal("cli", name); } });
        });
    }
    items.push({ separator: true });
    items.push({ label: "Clear Terminal", run: function () { runCommandId("terminal.clear"); } });
    showContextMenu(box.left, box.bottom + 2, items);
}

function runInTerminal(selectionOnly) {
    var editor = activeEditor();
    if (!editor) {
        return;
    }
    var code = selectionOnly ? editor.selectedText() : editor.getValue();
    if (selectionOnly && !code) {
        var pos = editor.lineColumn();
        code = editor.getValue().split("\n")[pos.line - 1] || "";
    }
    if (!code.trim()) {
        return;
    }
    showPanel("terminal");
    var term = activeTerminal();
    if (term.kind !== "js" || term.busy) {
        term = createTerminal("js");
    }
    term.input.value = code;
    term.submit();
}

function runCommandId(id) {
    var c = commandIndex[id];
    if (c) {
        closeMenus();
        c.run();
    }
}

function insertSnippetByName(name) {
    for (var i = 0; i < snippets.length; i++) {
        if (snippets[i].name === name) {
            insertIntoEditor(snippets[i].code);
            return;
        }
    }
}

function askShowAll() {
    showDialog({ title: "Run on all routers and switches", message: "IOS command", input: "show ip interface brief", buttons: ["Run", "Cancel"] }, function (choice, value) {
        if (choice === 0 && value) {
            runCode("runOnAll(" + JSON.stringify(value) + ").forEach(function (r) { log(r.device + \" [\" + r.status + \"]\\n\" + r.output); });", "Running \"" + value + "\" on every device");
        }
    });
}

function importClipboard() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function (text) {
            newFile("pasted.js", text);
        }, function () {
            notify("warning", "Clipboard access was blocked. Paste into a new file with Ctrl+V.");
            newFile("pasted.js", "");
        });
    } else {
        newFile("pasted.js", "");
    }
}

function nextProblem() {
    var editor = activeEditor();
    if (!editor || !app.problems.length) {
        return;
    }
    var line = editor.lineColumn(editor.selection().end).line;
    var next = app.problems.filter(function (p) {
        return p.line > line;
    })[0] || app.problems[0];
    editor.goToLine(next.line);
    byId("sb-message").textContent = next.message;
}

var menus = {
    File: ["file.new", "file.open", "folder.open", "-", "file.save", "file.saveAs", "file.saveAll", "-", "file.importClipboard", "file.download", "-", "file.rename", "file.close", "file.closeAll"],
    Edit: ["edit.undo", "edit.redo", "-", "edit.find", "edit.replace", "-", "edit.comment", "edit.deleteLine", "edit.copyAll"],
    Selection: ["edit.selectAll", "-", "edit.moveUp", "edit.moveDown", "edit.copyDown"],
    View: ["view.palette", "-", "view.explorer", "view.functions", "view.debug", "view.snippets", "view.devices", "view.tools", "view.plugins", "-", "view.problems", "view.output", "view.debugConsole", "terminal.toggle", "view.checks", "-", "view.sidebar", "view.panel", "view.panelMax", "-", "view.zoomIn", "view.zoomOut", "view.zoomReset"],
    Go: ["go.file", "go.line", "go.nextProblem", "-", "go.nextTab", "go.prevTab"],
    Run: ["debug.start", "run.script", "debug.stop", "debug.restart", "-", "debug.stepOver", "debug.stepInto", "debug.stepOut", "debug.stepBack", "debug.continue", "-", "debug.toggleBreakpoint", "debug.conditional", "debug.logpoint", "-", "debug.enableAll", "debug.disableAll", "debug.removeAll", "-", "run.selection"],
    Network: ["net.reach", "net.snapshot", "net.compare", "net.calc", "-", "run.audit", "run.summary", "run.inventory", "run.showAll", "run.cliScript", "-", "snippet.labcheck", "-", "plugins.new", "plugins.reload", "plugins.checks", "plugins.folder"],
    Terminal: ["terminal.new", "terminal.cli", "-", "terminal.runFile", "terminal.runSelection", "-", "terminal.clear", "terminal.kill"],
    Help: ["help.keys", "help.about"]
};

function renderMenubar() {
    byId("menubar").innerHTML = Object.keys(menus).map(function (name) {
        return "<div class=\"menu\" data-menu=\"" + name + "\"><span class=\"menu-title\">" + name + "</span><div class=\"menu-drop\">" + menus[name].map(function (id) {
            if (id === "-") {
                return "<div class=\"menu-sep\"></div>";
            }
            var c = commandIndex[id];
            return "<div class=\"menu-item\" data-cmd=\"" + id + "\"><span>" + escapeHtml(c.title) + "</span><span class=\"menu-key\">" + (c.key || "") + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
}

function closeMenus() {
    var open = document.querySelectorAll(".menu.open");
    for (var i = 0; i < open.length; i++) {
        open[i].classList.remove("open");
    }
    app.menuOpen = false;
}

function openPalette(prefix) {
    var box = byId("palette");
    box.classList.remove("hidden");
    var input = byId("palette-input");
    input.value = prefix;
    app.paletteIndex = 0;
    renderPalette();
    input.focus();
    input.setSelectionRange(prefix.length, prefix.length);
}

function closePalette() {
    byId("palette").classList.add("hidden");
    var editor = activeEditor();
    if (editor) {
        editor.focus();
    }
}

function paletteItems() {
    var value = byId("palette-input").value;
    if (value.charAt(0) === ">") {
        var q = value.substring(1).trim().toLowerCase();
        return commands.filter(function (c) {
            return !q || (c.category + ": " + c.title).toLowerCase().indexOf(q) !== -1 || suggestScore(c.title.replace(/\W/g, ""), q.replace(/\W/g, "")) >= 0 && q.length > 1;
        }).map(function (c) {
            return { label: c.category + ": " + c.title, key: c.key || "", run: function () { c.run(); } };
        });
    }
    if (value.charAt(0) === ":") {
        var editor = activeEditor();
        var line = parseInt(value.substring(1), 10);
        var total = editor ? editor.getValue().split("\n").length : 0;
        if (!editor) {
            return [{ label: "Open a file to go to a line", key: "", run: function () {} }];
        }
        return [{ label: isFinite(line) ? "Go to line " + line : "Type a line number between 1 and " + total, key: "", run: function () { if (isFinite(line)) { editor.goToLine(line); } } }];
    }
    var query = value.trim().toLowerCase();
    var items = [];
    app.order.forEach(function (id) {
        var f = app.files[id];
        if (!query || f.name.toLowerCase().indexOf(query) !== -1) {
            items.push({ label: f.name, detail: f.source === "workspace" ? "workspace" : f.path, icon: fileIcon(f.name), run: function () { openTab(id); } });
        }
    });
    if (app.folder) {
        app.folder.files.forEach(function (entry) {
            if (!findFileByPath(entry.path) && (!query || entry.name.toLowerCase().indexOf(query) !== -1)) {
                items.push({ label: entry.name, detail: app.folder.name, icon: fileIcon(entry.name), run: function () { openFolderEntry(entry.path); } });
            }
        });
    }
    items.push({ label: "Show and Run Commands", detail: ">", key: "Ctrl+Shift+P", run: function () { openPalette(">"); return true; } });
    return items;
}

function renderPalette() {
    app.paletteList = paletteItems();
    if (app.paletteIndex >= app.paletteList.length) {
        app.paletteIndex = 0;
    }
    byId("palette-list").innerHTML = app.paletteList.slice(0, 60).map(function (item, i) {
        return "<div class=\"pal-row" + (i === app.paletteIndex ? " selected" : "") + "\" data-index=\"" + i + "\">" + (item.icon || "") + "<span class=\"pal-label\">" + escapeHtml(item.label) +
            "</span><span class=\"pal-detail\">" + escapeHtml(item.detail || "") + "</span><span class=\"pal-key\">" + escapeHtml(item.key || "") + "</span></div>";
    }).join("") || "<div class=\"pal-empty\">No matching commands</div>";
    var row = byId("palette-list").children[app.paletteIndex];
    if (row && row.scrollIntoView) {
        row.scrollIntoView({ block: "nearest" });
    }
}

function acceptPalette(index) {
    var item = app.paletteList[index];
    if (!item) {
        return;
    }
    closePalette();
    if (item.run() === true) {
        return;
    }
}

function openFind(withReplace) {
    var editor = activeEditor();
    if (!editor) {
        return;
    }
    app.findOpen = true;
    var box = byId("find");
    box.classList.remove("hidden");
    box.classList.toggle("with-replace", !!withReplace || box.classList.contains("with-replace") && withReplace !== false);
    if (withReplace) {
        box.classList.add("with-replace");
    }
    var selected = editor.selectedText();
    var input = byId("find-input");
    if (selected && selected.indexOf("\n") === -1) {
        input.value = selected;
    }
    input.focus();
    input.select();
    runFind();
}

function closeFind() {
    app.findOpen = false;
    byId("find").classList.add("hidden");
    var editor = activeEditor();
    if (editor) {
        editor.clearSearch();
        editor.focus();
    }
}

function findOptions() {
    return {
        caseSensitive: byId("find-case").classList.contains("on"),
        wholeWord: byId("find-word").classList.contains("on"),
        regex: byId("find-regex").classList.contains("on")
    };
}

function runFind() {
    var editor = activeEditor();
    if (!editor) {
        return;
    }
    editor.setSearch(byId("find-input").value, findOptions());
    refreshFindCount();
}

function refreshFindCount() {
    var editor = activeEditor();
    if (!editor) {
        return;
    }
    var count = byId("find-count");
    var query = byId("find-input").value;
    byId("find-input").classList.toggle("invalid", !!editor.searchInvalid || (!!query && !editor.matches.length));
    count.textContent = !query ? "No results" : editor.searchInvalid ? "Invalid pattern" : editor.matches.length ? (editor.matchIndex + 1) + " of " + editor.matches.length : "No results";
}

function findStep(step) {
    var editor = activeEditor();
    if (editor) {
        editor.findStep(step);
        refreshFindCount();
    }
}

var shortcutKeys = [
    ["Ctrl+Shift+P, F1", "Command palette"], ["Ctrl+P", "Go to file"], ["Ctrl+G", "Go to line"], ["F5", "Start debugging / continue"], ["Ctrl+F5, Ctrl+Enter", "Run without debugging"],
    ["Shift+F5", "Stop debugging"], ["Ctrl+Shift+F5", "Restart debugging"], ["F10", "Step over"], ["F11", "Step into"], ["Shift+F11", "Step out"], ["Shift+F10", "Step back"], ["F9", "Toggle breakpoint"],
    ["Ctrl+`", "Toggle terminal"], ["Ctrl+Shift+`", "New terminal"], ["Ctrl+Shift+Y", "Debug console"], ["Ctrl+Shift+D", "Run and Debug"], ["Ctrl+Shift+Enter", "Run selection"],
    ["Ctrl+S", "Save"], ["Ctrl+Shift+S", "Save as"], ["Ctrl+O", "Open file"], ["Ctrl+N", "New file"], ["Ctrl+W", "Close editor"], ["Ctrl+Tab", "Next editor"],
    ["Ctrl+F", "Find"], ["Ctrl+H", "Replace"], ["F3, Shift+F3", "Next / previous match"], ["Ctrl+/", "Toggle line comment"], ["Ctrl+Space", "Suggestions"],
    ["Tab, Shift+Tab", "Indent / outdent"], ["Alt+Up/Down", "Move line"], ["Shift+Alt+Up/Down", "Copy line"], ["Ctrl+Shift+K", "Delete line"], ["Ctrl+L", "Select line"],
    ["Ctrl+B", "Toggle side bar"], ["Ctrl+J", "Toggle panel"], ["Ctrl+Shift+M", "Problems"], ["F8", "Next problem"], ["Ctrl+= / Ctrl+-", "Zoom"]
];

function showShortcuts() {
    showDialog({
        title: "Keyboard Shortcuts",
        html: "<table class=\"keys\">" + shortcutKeys.map(function (k) {
            return "<tr><td>" + k[1] + "</td><td>" + k[0].split(", ").map(function (x) {
                return x.split("+").map(function (part) {
                    return "<kbd>" + escapeHtml(part) + "</kbd>";
                }).join("+");
            }).join(" or ") + "</td></tr>";
        }).join("") + "</table>",
        buttons: ["Close"]
    });
}

function showAbout() {
    showDialog({
        title: "PTForge",
        html: "<p>Version " + appVersion + "</p><p>JavaScript automation for Cisco Packet Tracer. " + functionCatalog.length + " functions.</p><p>" + (inPacketTracer ? "Connected to Packet Tracer." : "Preview mode, scripts run only inside Packet Tracer.") + "</p><p class=\"muted\">github.com/r4chan842/PTForge &middot; MIT License</p>",
        buttons: ["OK"]
    });
}

function showDialog(options, callback) {
    var layer = byId("dialog");
    var box = byId("dialog-box");
    box.innerHTML = "<div class=\"dlg-title\">" + escapeHtml(options.title || "") + "</div>" +
        (options.message ? "<div class=\"dlg-msg\">" + escapeHtml(options.message) + "</div>" : "") +
        (options.html ? "<div class=\"dlg-html\">" + options.html + "</div>" : "") +
        (options.input !== undefined ? "<input class=\"dlg-input\" id=\"dialog-input\" spellcheck=\"false\">" : "") +
        "<div class=\"dlg-buttons\">" + options.buttons.map(function (label, i) {
            return "<button class=\"btn" + (i === 0 ? options.danger ? " danger" : " primary" : "") + "\" data-choice=\"" + i + "\">" + escapeHtml(label) + "</button>";
        }).join("") + "</div>";
    layer.classList.remove("hidden");
    app.dialogCallback = callback || function () {};
    app.dialogCancel = options.buttons.length - 1;
    var input = byId("dialog-input");
    if (input) {
        input.value = options.input;
        input.focus();
        var dot = options.input.lastIndexOf(".");
        input.setSelectionRange(0, dot > 0 ? dot : options.input.length);
    } else {
        box.querySelector(".btn").focus();
    }
}

function closeDialog(choice) {
    var input = byId("dialog-input");
    var value = input ? input.value : undefined;
    byId("dialog").classList.add("hidden");
    var callback = app.dialogCallback;
    app.dialogCallback = null;
    if (callback) {
        callback(choice, value);
    }
}

function notify(kind, text) {
    var host = byId("toasts");
    var toast = document.createElement("div");
    toast.className = "toast " + kind;
    toast.innerHTML = icon(kind === "error" ? "error" : kind === "warning" ? "warning" : "info", "sev-" + kind) + "<span>" + escapeHtml(text) + "</span>";
    host.appendChild(toast);
    setTimeout(function () {
        toast.classList.add("fade");
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }, kind === "error" ? 6000 : 3000);
}

function keyName(event) {
    var parts = [];
    if (event.ctrlKey || event.metaKey) {
        parts.push("Ctrl");
    }
    if (event.shiftKey) {
        parts.push("Shift");
    }
    if (event.altKey) {
        parts.push("Alt");
    }
    var key = event.key;
    if (key === "+") {
        key = "=";
    }
    if (key.length === 1) {
        key = key.toUpperCase();
    }
    if (key === " ") {
        key = "Space";
    }
    parts.push(key);
    return parts.join("+");
}

var globalKeys = {
    "Ctrl+Shift+P": "view.palette", "F1": "view.palette", "Ctrl+P": "go.file", "Ctrl+G": "go.line", "Ctrl+N": "file.new", "Ctrl+O": "file.open",
    "Ctrl+S": "file.save", "Ctrl+Shift+S": "file.saveAs", "Ctrl+Alt+S": "file.saveAll", "Ctrl+W": "file.close", "Ctrl+Tab": "go.nextTab", "Ctrl+Shift+Tab": "go.prevTab",
    "Ctrl+PageDown": "go.nextTab", "Ctrl+PageUp": "go.prevTab", "F5": "debug.start", "Ctrl+F5": "run.script", "Ctrl+Enter": "run.script", "Ctrl+Shift+Enter": "run.selection",
    "Shift+F5": "debug.stop", "Ctrl+Shift+F5": "debug.restart", "F10": "debug.stepOver", "F11": "debug.stepInto", "Shift+F11": "debug.stepOut", "Shift+F10": "debug.stepBack", "F9": "debug.toggleBreakpoint",
    "Ctrl+`": "terminal.toggle", "Ctrl+Shift+`": "terminal.new", "Ctrl+Shift+~": "terminal.new", "Ctrl+Shift+Y": "view.debugConsole", "Ctrl+Shift+D": "view.debug",
    "Ctrl+F": "edit.find", "Ctrl+H": "edit.replace", "Ctrl+B": "view.sidebar", "Ctrl+J": "view.panel", "Ctrl+Shift+E": "view.explorer", "Ctrl+Shift+F": "view.functions",
    "Ctrl+Shift+T": "view.tools", "Ctrl+Shift+X": "view.plugins", "Ctrl+Shift+M": "view.problems", "Ctrl+Shift+U": "view.output", "Ctrl+=": "view.zoomIn",
    "Ctrl+-": "view.zoomOut", "Ctrl+0": "view.zoomReset", "F2": "file.rename", "F8": "go.nextProblem"
};

var fieldKeys = { "Ctrl+Enter": true, "Ctrl+Shift+Enter": true, "F2": true, "Ctrl+W": true, "F9": true };

function onGlobalKey(event) {
    var name = keyName(event);
    if (!byId("dialog").classList.contains("hidden")) {
        if (event.key === "Escape") {
            closeDialog(app.dialogCancel);
            event.preventDefault();
        } else if (event.key === "Enter" && event.target.tagName !== "BUTTON") {
            closeDialog(0);
            event.preventDefault();
        }
        return;
    }
    if (app.chord) {
        app.chord = false;
        event.preventDefault();
        if (name === "Ctrl+O") {
            runCommandId("folder.open");
        } else if (name === "Ctrl+S") {
            runCommandId("help.keys");
        }
        return;
    }
    if (name === "Ctrl+K") {
        app.chord = true;
        byId("sb-message").textContent = "(Ctrl+K) was pressed. Waiting for second key of chord...";
        event.preventDefault();
        return;
    }
    if (event.key === "Escape" && (debugState.menu || debugState.widget)) {
        if (debugState.menu) {
            closeContextMenu();
            event.preventDefault();
            return;
        }
    }
    if (event.key === "Escape") {
        hideDebugHover();
        if (app.menuOpen) {
            closeMenus();
        } else if (!byId("palette").classList.contains("hidden")) {
            closePalette();
        } else if (app.findOpen) {
            closeFind();
        }
        return;
    }
    if ((name === "F3" || name === "Shift+F3") && app.findOpen) {
        findStep(event.shiftKey ? -1 : 1);
        event.preventDefault();
        return;
    }
    if (event.target.id === "palette-input" || (event.target.tagName === "INPUT" && !/^(Ctrl|Shift\+F\d|F\d)/.test(name))) {
        return;
    }
    var id = globalKeys[name];
    if (id === "file.rename" && event.target.tagName === "TEXTAREA") {
        return;
    }
    var inField = event.target.closest && event.target.closest(".term, .dc-input-row, .vt, .bp-widget, .dv-watch-input");
    if (inField && fieldKeys[name]) {
        return;
    }
    if (id === "debug.start" && debugState.session) {
        id = "debug.continue";
    }
    if (/^debug\.step/.test(id || "") && !debugState.session) {
        return;
    }
    if (id) {
        event.preventDefault();
        event.stopPropagation();
        runCommandId(id);
    }
}

function onPaletteKey(event) {
    var count = Math.min(60, app.paletteList.length);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        app.paletteIndex = (app.paletteIndex + (event.key === "ArrowDown" ? 1 : -1) + count) % Math.max(1, count);
        renderPalette();
        event.preventDefault();
    } else if (event.key === "Enter") {
        acceptPalette(app.paletteIndex);
        event.preventDefault();
    } else if (event.key === "Escape") {
        closePalette();
        event.preventDefault();
        event.stopPropagation();
    }
}

function startDrag(event, kind) {
    event.preventDefault();
    var startX = event.clientX;
    var startY = event.clientY;
    var startWidth = app.sidebarWidth;
    var startHeight = app.panelHeight;
    document.body.classList.add(kind === "side" ? "dragging-x" : "dragging-y");
    function move(e) {
        if (kind === "side") {
            app.sidebarWidth = Math.max(170, Math.min(window.innerWidth - 360, startWidth + e.clientX - startX));
        } else {
            app.panelHeight = Math.max(80, Math.min(window.innerHeight - 200, startHeight - (e.clientY - startY)));
        }
        layout();
    }
    function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        document.body.classList.remove("dragging-x", "dragging-y");
        persist();
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

function toggleSection(head) {
    head.classList.toggle("collapsed");
    var name = head.getAttribute("data-section");
    if (/^(open|workspace|folder)$/.test(name)) {
        app.collapsed = Array.prototype.map.call(document.querySelectorAll("#view-explorer .section-head.collapsed"), function (h) {
            return h.getAttribute("data-section");
        });
    }
}

function onClick(event) {
    var t = event.target;
    var node;
    if (debugState.menu && !t.closest(".ctx-menu")) {
        closeContextMenu();
    }
    if (debugState.widget && !t.closest(".bp-widget")) {
        closeBreakpointWidget();
    }
    if (t.closest("#view-debug") && onDebugViewClick(event)) {
        return;
    }
    if (t.closest("#debug-hover")) {
        onDebugHoverClick(event);
        return;
    }
    if (onSnapshotClick(event)) {
        return;
    }
    if (t.closest(".vt") && onViewClick(event)) {
        return;
    }
    if ((node = t.closest("[data-term-kill]"))) {
        killTerminal(node.getAttribute("data-term-kill"));
        return;
    }
    if ((node = t.closest("[data-term-tab]"))) {
        activateTerminal(node.getAttribute("data-term-tab"));
        return;
    }
    if ((node = t.closest("[data-debug-line]"))) {
        var session = debugState.session;
        var target = session ? session.fileId : app.active;
        if (target && app.files[target]) {
            activate(target);
            app.editors[target].goToLine(Number(node.getAttribute("data-debug-line")));
        }
        return;
    }
    if ((node = t.closest("[data-calc-open]"))) {
        openCalculator(node.getAttribute("data-calc-open"));
        return;
    }
    if ((node = t.closest(".menu-title"))) {
        var menu = node.parentNode;
        var wasOpen = menu.classList.contains("open");
        closeMenus();
        if (!wasOpen) {
            menu.classList.add("open");
            app.menuOpen = true;
        }
        return;
    }
    if (!t.closest(".menu")) {
        closeMenus();
    }
    if ((node = t.closest("[data-choice]"))) {
        closeDialog(Number(node.getAttribute("data-choice")));
        return;
    }
    if ((node = t.closest("[data-close]"))) {
        event.stopPropagation();
        closeTab(node.getAttribute("data-close"));
        return;
    }
    if ((node = t.closest("[data-rename]"))) {
        renameFile(node.getAttribute("data-rename"));
        return;
    }
    if ((node = t.closest("[data-delete]"))) {
        deleteFile(node.getAttribute("data-delete"));
        return;
    }
    if ((node = t.closest("[data-cmd]"))) {
        runCommandId(node.getAttribute("data-cmd"));
        return;
    }
    if ((node = t.closest(".tab"))) {
        activate(node.getAttribute("data-id"));
        return;
    }
    if ((node = t.closest("[data-open]"))) {
        openTab(node.getAttribute("data-open"));
        return;
    }
    if ((node = t.closest("[data-path]"))) {
        openFolderEntry(node.getAttribute("data-path"));
        return;
    }
    if ((node = t.closest("[data-view]"))) {
        showView(node.getAttribute("data-view"), true);
        return;
    }
    if ((node = t.closest(".panel-tab"))) {
        showPanel(node.getAttribute("data-panel"));
        return;
    }
    if ((node = t.closest("[data-device]"))) {
        event.stopPropagation();
        insertIntoEditor(JSON.stringify(node.getAttribute("data-device")));
        return;
    }
    if ((node = t.closest("[data-port]"))) {
        insertIntoEditor(JSON.stringify(node.getAttribute("data-port")));
        return;
    }
    if ((node = t.closest(".section-head"))) {
        toggleSection(node);
        return;
    }
    if ((node = t.closest("[data-insert]"))) {
        var fn = node.getAttribute("data-insert");
        insertIntoEditor(fn + "(");
        return;
    }
    if ((node = t.closest("[data-snippet-insert]"))) {
        insertIntoEditor(snippets[Number(node.getAttribute("data-snippet-insert"))].code);
        return;
    }
    if ((node = t.closest("[data-snippet-new]"))) {
        var s = snippets[Number(node.getAttribute("data-snippet-new"))];
        newFile(s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".js", s.code);
        return;
    }
    if ((node = t.closest(".problem"))) {
        var fix = t.closest("[data-fix]");
        if (fix) {
            applyQuickFix(Number(fix.getAttribute("data-fix")));
            return;
        }
        var p = app.problems[Number(node.getAttribute("data-index"))];
        if (p && activeEditor()) {
            activeEditor().goToLine(p.line);
        }
        return;
    }
    if ((node = t.closest(".copyable"))) {
        copyText(node.textContent);
        return;
    }
    if ((node = t.closest(".pal-row"))) {
        acceptPalette(Number(node.getAttribute("data-index")));
        return;
    }
    if (t.id === "palette") {
        closePalette();
    }
}

function buildLayout() {
    byId("activitybar").innerHTML = [
        ["explorer", "files", "Explorer (Ctrl+Shift+E)"], ["search", "search", "Function Reference (Ctrl+Shift+F)"], ["debug", "debug", "Run and Debug (Ctrl+Shift+D)"],
        ["snippets", "snippets", "Snippets"], ["devices", "devices", "Devices"], ["tools", "tools", "Network Tools (Ctrl+Shift+T)"], ["plugins", "extensions", "Plugins (Ctrl+Shift+X)"]
    ].map(function (a) {
        return "<div class=\"act\" data-view=\"" + a[0] + "\" title=\"" + a[2] + "\">" + icon(a[1]) + "</div>";
    }).join("") + "<div class=\"act-grow\"></div><div class=\"act\" data-cmd=\"view.checks\" title=\"Lab Check reports\">" + icon("checks") + "</div>";

    byId("sidebar").innerHTML =
        view("explorer", "Explorer", "<span class=\"sec-act\" data-cmd=\"file.new\" title=\"New File\">" + icon("newFile") + "</span><span class=\"sec-act\" data-cmd=\"file.open\" title=\"Open File\">" + icon("openFile") + "</span><span class=\"sec-act\" data-cmd=\"folder.open\" title=\"Open Folder\">" + icon("folder") + "</span>", "") +
        view("search", "Function Reference", "", "<div class=\"search-box\"><input id=\"fn-search\" placeholder=\"Search " + functionCatalog.length + " functions\" spellcheck=\"false\"><span id=\"fn-count\" class=\"count-note\"></span></div><div id=\"fn-list\"></div>") +
        view("snippets", "Snippets", "", "<div id=\"snippet-list\"></div>") +
        view("plugins", "Plugins", "<span class=\"sec-act\" data-cmd=\"plugins.new\" title=\"New Plugin\">" + icon("add") + "</span><span class=\"sec-act\" data-cmd=\"plugins.checks\" title=\"Run Plugin Checks\">" + icon("checks") + "</span><span class=\"sec-act\" data-cmd=\"plugins.reload\" title=\"Reload Plugins\">" + icon("refresh") + "</span><span class=\"sec-act\" data-cmd=\"plugins.folder\" title=\"Change Plugin Folder\">" + icon("folder") + "</span>",
            "<div class=\"search-box\"><input id=\"plugin-search\" placeholder=\"Search plugins\" spellcheck=\"false\"><span id=\"plugin-count\" class=\"count-note\"></span></div><div id=\"plugin-list\"></div><div class=\"plug-folder\">" + icon("folder") + "<span id=\"plugin-folder\"></span></div>") +
        view("devices", "Devices", "<span class=\"sec-act\" data-cmd=\"run.audit\" title=\"Audit Network\">" + icon("checks") + "</span><span class=\"sec-act\" id=\"dev-refresh\" title=\"Refresh\">" + icon("refresh") + "</span>",
            "<div class=\"search-box\"><input id=\"dev-search\" placeholder=\"Filter devices\" spellcheck=\"false\"><span id=\"dev-count\" class=\"count-note\"></span></div><div id=\"device-list\"></div>" +
            sectionHead("snapshots", "Snapshots", "<span class=\"sec-act\" data-cmd=\"net.snapshot\" title=\"Take Snapshot\">" + icon("snapshot") + "</span><span class=\"sec-act\" data-cmd=\"net.compare\" title=\"Compare Snapshots\">" + icon("diff") + "</span>") +
            "<div class=\"section-body\"><div id=\"snapshot-list\"></div></div>" +
            "<div class=\"dev-actions\"><button class=\"btn block primary\" data-cmd=\"net.reach\">Reachability Matrix</button><button class=\"btn block\" data-cmd=\"run.audit\">Audit Network</button><button class=\"btn block\" data-cmd=\"run.summary\">Topology Summary</button><button class=\"btn block\" data-cmd=\"run.showAll\">Show Command on All</button><button class=\"btn block\" data-cmd=\"run.cliScript\">Command Log to Script</button></div>") +
        view("debug", "Run and Debug", "<span class=\"sec-act\" data-cmd=\"debug.start\" title=\"Start Debugging (F5)\">" + icon("runFill", "run-ico") + "</span><span class=\"sec-act\" data-cmd=\"debug.clearConsole\" title=\"Clear Console\">" + icon("clear") + "</span>",
            "<div class=\"debug-start\" id=\"debug-start\"><button class=\"btn primary block\" data-cmd=\"debug.start\">Run and Debug</button>" +
            "<p class=\"tree-hint\">Runs the active script in Packet Tracer and records every step. Then pause on breakpoints, step forward and back, and read variables. Press <kbd>F5</kbd>.</p>" +
            "<label class=\"check-line\"><input type=\"checkbox\" id=\"debug-entry\"><span>Stop on entry</span></label>" +
            "<label class=\"check-line\"><span>Recorded steps</span><select class=\"vt-select mini\" id=\"debug-limit\"><option value=\"1000\">1,000</option><option value=\"3000\">3,000</option><option value=\"10000\">10,000</option><option value=\"20000\">20,000</option></select></label>" +
            "<p class=\"tree-hint\">To run code line by line, <a data-cmd=\"terminal.new\">open a terminal</a>.</p></div>" +
            "<div id=\"debug-sections\"><div class=\"debug-progress\" id=\"debug-progress\"></div>" +
            "<div id=\"sec-variables\">" + sectionHead("dbg-vars", "Variables", "<span class=\"sec-act\" data-cmd=\"debug.collapse\" title=\"Collapse All\">" + icon("collapseAll") + "</span>") + "<div class=\"section-body\"><div id=\"dbg-variables\" class=\"dv-tree\"></div></div></div>" +
            sectionHead("dbg-watch", "Watch", "<span class=\"sec-act\" data-cmd=\"debug.addWatch\" title=\"Add Expression\">" + icon("add") + "</span><span class=\"sec-act\" data-cmd=\"debug.removeWatches\" title=\"Remove All Expressions\">" + icon("closeAll") + "</span>") + "<div class=\"section-body\"><div id=\"dbg-watch\" class=\"dv-tree\"></div></div>" +
            "<div id=\"sec-stack\">" + sectionHead("dbg-stack", "Call Stack", "") + "<div class=\"section-body\"><div id=\"dbg-stack\"></div></div></div>" +
            sectionHead("dbg-bps", "Breakpoints", "<span class=\"sec-act\" data-cmd=\"debug.toggleActive\" title=\"Toggle Activate Breakpoints\">" + icon("breakpoints") + "</span><span class=\"sec-act\" data-cmd=\"debug.removeAll\" title=\"Remove All Breakpoints\">" + icon("closeAll") + "</span>") + "<div class=\"section-body\"><div id=\"dbg-breakpoints\"></div></div></div>") +
        view("tools", "Network Tools", "<span class=\"sec-act\" data-cmd=\"net.calc\" title=\"Open Network Calculator\">" + icon("calculator") + "</span>",
            sectionHead("tool-calcs", "Calculators", "") + "<div class=\"section-body\">" + calcTools.map(function (tool) {
                return "<div class=\"tree-row\" data-calc-open=\"" + tool.id + "\" title=\"" + escapeHtml(tool.info) + "\">" + icon("calculator") + "<span class=\"row-name\">" + escapeHtml(tool.title) + "</span></div>";
            }).join("") + "</div>" +
            sectionHead("tool-tests", "Network Tests", "") + "<div class=\"section-body\"><div class=\"tree-row\" data-cmd=\"net.reach\">" + icon("pulse") + "<span class=\"row-name\">Reachability Matrix</span></div><div class=\"tree-row\" data-cmd=\"net.snapshot\">" + icon("snapshot") + "<span class=\"row-name\">Take Snapshot</span></div><div class=\"tree-row\" data-cmd=\"net.compare\">" + icon("diff") + "<span class=\"row-name\">Compare Snapshots</span></div><div class=\"tree-row\" data-cmd=\"run.audit\">" + icon("checks") + "<span class=\"row-name\">Audit Network</span></div></div>" +
            sectionHead("tool-quick", "Quick Calculations", "") + "<div class=\"section-body\">" +
            "<div class=\"tool\"><div class=\"tool-title\">Subnet</div><input id=\"calc-subnet\" value=\"192.168.10.77/26\" spellcheck=\"false\"><div id=\"calc-subnet-out\"></div></div>" +
            "<div class=\"tool\"><div class=\"tool-title\">VLSM</div><input id=\"calc-vlsm-base\" value=\"192.168.1.0/24\" spellcheck=\"false\"><input id=\"calc-vlsm-list\" value=\"Sales:50, IT:20, Guest:12, WAN:2\" spellcheck=\"false\"><div id=\"calc-vlsm-out\"></div></div>" +
            "<div class=\"tool\"><div class=\"tool-title\">Mask and wildcard</div><input id=\"calc-wild\" value=\"255.255.255.224\" spellcheck=\"false\"><div id=\"calc-wild-out\"></div></div></div>");
}

function view(name, title, actions, body) {
    return "<div class=\"view hidden\" id=\"view-" + name + "\"><div class=\"view-head\"><span>" + title + "</span><span class=\"view-acts\">" + actions + "</span></div><div class=\"view-body\">" + body + "</div></div>";
}

function renderWelcome() {
    var key = function (list) {
        return list.split("+").map(function (k) { return "<kbd>" + k + "</kbd>"; }).join("+");
    };
    byId("welcome").innerHTML = "<div class=\"welcome-inner\"><div class=\"wl-logo\">" + byId("brand-logo").innerHTML + "</div><h1>PTForge</h1><p class=\"wl-sub\">Automation for Cisco Packet Tracer</p>" +
        "<div class=\"wl-cols\"><div><h2>Start</h2>" +
        "<a data-cmd=\"file.new\">" + icon("newFile") + "New File...</a><a data-cmd=\"file.open\">" + icon("openFile") + "Open File...</a><a data-cmd=\"folder.open\">" + icon("folder") + "Open Folder...</a><a data-cmd=\"terminal.new\">" + icon("terminal") + "New Terminal</a>" +
        "<h2>Network</h2><a data-cmd=\"net.reach\">" + icon("pulse") + "Reachability Matrix</a><a data-cmd=\"net.snapshot\">" + icon("snapshot") + "Take Snapshot</a><a data-cmd=\"net.calc\">" + icon("calculator") + "Network Calculator</a><a data-cmd=\"run.audit\">" + icon("checks") + "Audit Network</a></div>" +
        "<div><h2>Shortcuts</h2><div class=\"wl-keys\"><span>Show All Commands</span><span>" + key("Ctrl+Shift+P") + "</span><span>Go to File</span><span>" + key("Ctrl+P") + "</span>" +
        "<span>Start Debugging</span><span>" + key("F5") + "</span><span>Run Without Debugging</span><span>" + key("Ctrl+F5") + "</span><span>Toggle Breakpoint</span><span>" + key("F9") + "</span><span>Toggle Terminal</span><span>" + key("Ctrl+`") + "</span><span>Find</span><span>" + key("Ctrl+F") + "</span><span>Suggestions</span><span>" + key("Ctrl+Space") + "</span></div></div></div></div>";
}

function bindEvents() {
    document.addEventListener("keydown", onGlobalKey, true);
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", function (event) {
        var tab = event.target.closest(".tab");
        if (tab && event.button === 1) {
            closeTab(tab.getAttribute("data-id"));
        }
    });
    document.addEventListener("dblclick", function (event) {
        var row = event.target.closest("[data-open]");
        if (row && app.files[row.getAttribute("data-open")] && app.files[row.getAttribute("data-open")].source === "workspace") {
            renameFile(row.getAttribute("data-open"));
            return;
        }
        if (event.target.closest("#tabs") && !event.target.closest(".tab")) {
            newFile();
        }
    });
    document.addEventListener("mouseover", function (event) {
        if (app.menuOpen) {
            var menu = event.target.closest(".menu");
            if (menu && !menu.classList.contains("open")) {
                closeMenus();
                menu.classList.add("open");
                app.menuOpen = true;
            }
        }
    });
    byId("sash-side").addEventListener("mousedown", function (e) {
        startDrag(e, "side");
    });
    byId("sash-panel").addEventListener("mousedown", function (e) {
        startDrag(e, "panel");
    });
    byId("palette-input").addEventListener("input", function () {
        app.paletteIndex = 0;
        renderPalette();
    });
    byId("palette-input").addEventListener("keydown", onPaletteKey);
    byId("fn-search").addEventListener("input", renderFunctions);
    byId("dev-search").addEventListener("input", renderDevices);
    byId("plugin-search").addEventListener("input", renderPlugins);
    byId("plugin-list").addEventListener("click", onPluginClick);
    byId("dev-refresh").addEventListener("click", refreshDevices);
    byId("find-input").addEventListener("input", runFind);
    byId("find-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            findStep(e.shiftKey ? -1 : 1);
            e.preventDefault();
        }
    });
    byId("replace-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            replaceOne(e.ctrlKey && e.altKey);
            e.preventDefault();
        }
    });
    ["find-case", "find-word", "find-regex"].forEach(function (id) {
        byId(id).addEventListener("click", function () {
            byId(id).classList.toggle("on");
            runFind();
        });
    });
    byId("find-prev").addEventListener("click", function () { findStep(-1); });
    byId("find-next").addEventListener("click", function () { findStep(1); });
    byId("find-close").addEventListener("click", closeFind);
    byId("find-toggle").addEventListener("click", function () {
        byId("find").classList.toggle("with-replace");
    });
    byId("replace-one").addEventListener("click", function () { replaceOne(false); });
    byId("replace-all").addEventListener("click", function () { replaceOne(true); });
    ["calc-subnet"].forEach(function (id) { byId(id).addEventListener("input", runSubnetCalc); });
    ["calc-vlsm-base", "calc-vlsm-list"].forEach(function (id) { byId(id).addEventListener("input", runVlsmCalc); });
    byId("calc-wild").addEventListener("input", runWildcardCalc);
    window.addEventListener("resize", function () {
        var editor = activeEditor();
        if (editor) {
            editor.render();
        }
    });
    byId("debug-entry").addEventListener("change", function (e) {
        debugState.stopOnEntry = e.target.checked;
        persist();
    });
    byId("debug-limit").addEventListener("change", function (e) {
        debugState.limit = Number(e.target.value) || 3000;
        persist();
    });
    byId("debug-console-input").addEventListener("keydown", onDebugConsoleKey);
    byId("debug-hover").addEventListener("mouseleave", hideDebugHover);
    document.addEventListener("input", onViewInput);
    document.addEventListener("keydown", function (e) {
        if (onWatchKey(e)) {
            e.preventDefault();
        }
    });
    bindDebugToolbar();
    window.addEventListener("beforeunload", persistNow);
}

function bindDebugToolbar() {
    var bar = byId("debug-toolbar");
    var grip = bar.querySelector(".dt-grip");
    grip.addEventListener("mousedown", function (event) {
        event.preventDefault();
        var startX = event.clientX;
        var startLeft = bar.offsetLeft;
        function move(e) {
            var parent = bar.parentNode.clientWidth;
            var left = Math.max(0, Math.min(parent - bar.offsetWidth, startLeft + e.clientX - startX));
            bar.style.left = left + "px";
            bar.style.transform = "none";
        }
        function up() {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });
}

function replaceOne(all) {
    var editor = activeEditor();
    if (!editor) {
        return;
    }
    var value = byId("replace-input").value;
    if (all) {
        var count = editor.replaceAll(value);
        if (count) {
            notify("info", "Replaced " + count + " occurrence" + (count === 1 ? "" : "s"));
        }
    } else {
        editor.replaceCurrent(value);
    }
    refreshFindCount();
}

function restoreState(saved) {
    var state = null;
    try {
        state = saved ? JSON.parse(saved) : null;
    } catch (error) {
        state = null;
    }
    if (state && state.version === 2) {
        app.nextId = state.nextId || 1;
        (state.files || []).forEach(function (f) {
            app.files[f.id] = f;
            app.order.push(f.id);
            var num = parseInt(String(f.id).substring(1), 10);
            if (num >= app.nextId) {
                app.nextId = num + 1;
            }
        });
        ["folder", "fontSize", "view", "sidebarVisible", "sidebarWidth", "panelVisible", "panelHeight", "panelTab"].forEach(function (key) {
            if (state[key] !== undefined && state[key] !== null) {
                app[key] = state[key];
            }
        });
        app.open = (state.open || []).filter(function (id) {
            return !!app.files[id];
        });
        restoreDebugSettings(state.debug);
        terminalState.history = Array.isArray(state.termHistory) ? state.termHistory.filter(function (h) { return typeof h === "string"; }) : [];
        return app.files[state.active] ? state.active : app.open[0] || null;
    }
    return null;
}

function migrateSlots(done) {
    var found = [];
    var keys = ["code", "code2", "code3"];
    var pending = keys.length;
    keys.forEach(function (key, index) {
        readData(key, function (value) {
            if (value && value.trim()) {
                found[index] = value;
            }
            pending--;
            if (!pending) {
                done(found.filter(Boolean));
            }
        });
    });
}

var starterScript = "addDevice(\"R1\", \"2911\", 300, 80);\naddDevice(\"S1\", \"2960-24TT\", 300, 220);\naddLink(\"R1\", \"GigabitEthernet0/0\", \"S1\", \"GigabitEthernet0/1\", \"straight\");\n\nsetInterfaceIp(\"R1\", \"GigabitEthernet0/0\", \"192.168.1.1/24\");\nbuildLan({ switchName: \"S1\", hosts: 3, network: \"192.168.1.0/24\", x: 300, y: 220 });\n\nauditNetwork();\n";

function initEditor() {
    buildLayout();
    renderMenubar();
    renderWelcome();
    renderFunctions();
    renderSnippets();
    renderDevices();
    renderChecks();
    renderProblems();
    runSubnetCalc();
    runVlsmCalc();
    runWildcardCalc();
    bindEvents();
    renderSnapshots();
    terminalState.host = {
        connected: function () { return inPacketTracer; },
        engine: callEngine,
        fileText: function (name) {
            for (var i = 0; i < app.order.length; i++) {
                var f = app.files[app.order[i]];
                if (f.name === name || f.name === name + ".js") {
                    return f.text;
                }
            }
            return null;
        },
        saveHistory: function () { persist(); },
        version: appVersion
    };
    byId("sb-mode").innerHTML = inPacketTracer ? icon("devices") + "Packet Tracer" : icon("warning") + "Preview";
    byId("sb-mode").title = inPacketTracer ? "Connected to Packet Tracer" : "Not running inside Packet Tracer, scripts cannot run";
    readData(storageKey, function (saved) {
        var active = restoreState(saved);
        if (saved && app.order.length) {
            finishInit(active);
            return;
        }
        migrateSlots(function (slots) {
            if (slots.length) {
                slots.forEach(function (text, i) {
                    var id = createFile({ name: "script-" + (i + 1) + ".js", text: text });
                    app.open.push(id);
                });
            } else {
                app.open.push(createFile({ name: "lab.js", text: starterScript }));
            }
            finishInit(app.open[0]);
        });
    });
}

function finishInit(active) {
    setFontSize(app.fontSize);
    layout();
    renderExplorer();
    activate(active);
    renderDebugView();
    if (app.panelVisible && app.panelTab === "terminal" && !terminalState.list.length) {
        createTerminal("js");
    }
    persist();
}
