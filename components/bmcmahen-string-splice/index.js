module.exports = function(str, i, i2, substr){
  return str.substr(0, i) + substr + str.substr(i2);
};