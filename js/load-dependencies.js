function loadToolDependencies() {

  var dependency;
  var element = document.getElementsByTagName('body')[0];

  console.log('loading csf-waterdef-v4 css');
  dependency = document.createElement('link');
  dependency.setAttribute('rel','stylesheet');
  dependency.setAttribute('type','text/css');
  // eslint-disable-next-line no-undef
  dependency.setAttribute('href', CSFTOOL_URL + '/style/csf-waterdef-v4.css?v=4.0.0');
  element.appendChild(dependency);

}
loadToolDependencies();