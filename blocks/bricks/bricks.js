export default function decorate(block) {
  const bricks = [...block.firstElementChild.children];
  block.classList.add(`bricks-${bricks.length}-brks`);

  // setup image brick
  [...block.children].forEach((row) => {
    [...row.children].forEach((brk) => {
      const pic = brk.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in brick
          picWrapper.classList.add('bricks-img-brk');
        }
      }
    });
  });
}
  