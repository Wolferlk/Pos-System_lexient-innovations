let cloudConnected = false;

const setCloudConnected = (value) => {
  cloudConnected = Boolean(value);
};

const isCloudConnected = () => cloudConnected;

module.exports = {
  setCloudConnected,
  isCloudConnected,
};
