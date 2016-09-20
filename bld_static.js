var nj = require('nunjucks'),
    hm = require('html-minifier').minify,
    fs = require('fs');
nj.configure('views', { autoescape: true });

function build__rootForm(){
  //view
  v = ['head.html','location-form.html','footer.html'];
  //page
  p = '';
  for (var i = 0; i < v.length; i++) {
    //render
    r = nj.render(v[i], {title: 'Bus & Train Tracker'});
    r = hm(r, {
      collapseWhitespace: true,
      removeComments: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true,
      });
    //add to page
    p += r;
  }
  fs.createWriteStream('dist/site/index.html').write(p);
}

build__rootForm();
