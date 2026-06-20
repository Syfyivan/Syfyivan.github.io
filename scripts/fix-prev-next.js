/* global hexo */
'use strict';

// Fix reversed prev/next post links in the Fluid theme footer.
//
// Hexo's `page.prev` points to the chronologically NEWER post and `page.next`
// to the OLDER one. The theme renders prev_post() on the left labeled 上一篇
// and next_post() on the right labeled 下一篇, which reads backwards for our
// sequentially dated chapters (left ends up pointing at the next chapter).
//
// Re-register both helpers swapped so that:
//   左 · 上一篇 = the chronologically earlier post (the real previous chapter)
//   右 · 下一篇 = the chronologically later post   (the real next chapter)
//
// The theme registers these helpers when its scripts load, which happens
// AFTER this site script. Defer our override to `generateBefore` (fires once,
// after all plugin/theme scripts have loaded) so ours wins.

function earlierPost(post) {
  const earlier = post.next; // older post = the actual previous chapter
  if (!earlier) {
    return null;
  }
  return earlier.hide ? earlierPost(earlier) : earlier;
}

function laterPost(post) {
  const later = post.prev; // newer post = the actual next chapter
  if (!later) {
    return null;
  }
  return later.hide ? laterPost(later) : later;
}

hexo.on('generateBefore', function () {
  hexo.extend.helper.register('prev_post', earlierPost);
  hexo.extend.helper.register('next_post', laterPost);
});
