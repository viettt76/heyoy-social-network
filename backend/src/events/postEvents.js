const postEvents = (socket) => {
  socket.on('joinPost', (postId) => {
    socket.join(`post-${postId}`);
  });
};

module.exports = postEvents;
