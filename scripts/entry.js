require.config({
    baseUrl: 'scripts',
    paths: {
        libs: 'libs',
        app: 'app',
        three: 'libs/three.min',
        jquery: 'libs/jquery-1.11.0.min',
        jquerymousewheel: 'libs/jquery.mousewheel.min'
    }
});


requirejs(['app/frame'],function (Frame) {
	console.log('creating Entry');
});

