let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) {
    return null;
  }
  return ioInstance;
};