export const typeWriter = (
  text: string,
  callback: (current: string) => void,
  onComplete?: () => void,
  speed = 20,
) => {
  let i = 0;

  const type = () => {
    if (i <= text.length) {
      callback(text.substring(0, i));
      i++;
      const randomDelay = speed + Math.random() * 30;
      setTimeout(type, randomDelay);
    } else {
      if (onComplete) onComplete();
    }
  };

  type();
};
