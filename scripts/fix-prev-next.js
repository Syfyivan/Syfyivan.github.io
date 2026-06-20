/* global hexo */
'use strict';

// Make the Fluid theme's prev/next post links follow the fable course's
// READING ORDER (lesson, then chapter) instead of Hexo's date order — without
// changing any URLs (URLs are derived from the post date, so re-dating is not
// an option).
//
// For every post whose slug looks like `ai-agent-fables-NN-...`:
//   lesson  = NN
//   chapter = the digit in `-chM-` (overview posts have no `-chM-` => 0)
// Posts are chained 01.0 -> 01.1 -> ... -> 01.6 -> 02.0 -> 02.1 -> ... so an
// overview's 下一篇 is its own chapter 1, and a lesson's last chapter links to
// the next lesson's overview.
//
// Non-course posts fall back to date order, with the chronologically earlier
// post on the left (上一篇) and the later one on the right (下一篇). Hexo's
// `page.prev` is the newer post and `page.next` the older one, so we swap them.
//
// The theme registers prev_post/next_post when its scripts load, which happens
// after this site script, so we (re)register on `generateBefore` to win.

let orderedCache = null;

function fableKey(post) {
  const slug = (post && post.slug) || '';
  const m = slug.match(/^ai-agent-fables-(\d{2})-(.+)$/);
  if (!m) {
    return null;
  }
  const chMatch = m[2].match(/^ch(\d+)-/);
  return {
    lesson: parseInt(m[1], 10),
    chapter: chMatch ? parseInt(chMatch[1], 10) : 0
  };
}

function orderedCourse() {
  if (orderedCache) {
    return orderedCache;
  }
  orderedCache = hexo.locals.get('posts').toArray()
    .map(function (p) { return { post: p, key: fableKey(p) }; })
    .filter(function (x) { return x.key; })
    .sort(function (a, b) {
      return a.key.lesson - b.key.lesson || a.key.chapter - b.key.chapter;
    })
    .map(function (x) { return x.post; });
  return orderedCache;
}

function courseIndex(post) {
  if (!fableKey(post)) {
    return -1;
  }
  const ordered = orderedCourse();
  for (let i = 0; i < ordered.length; i += 1) {
    if (ordered[i]._id === post._id || ordered[i].slug === post.slug) {
      return i;
    }
  }
  return -1;
}

function dateEarlier(post) { // older post = the real previous post
  let p = post.next;
  while (p && p.hide) { p = p.next; }
  return p || null;
}

function dateLater(post) { // newer post = the real next post
  let p = post.prev;
  while (p && p.hide) { p = p.prev; }
  return p || null;
}

function prevPost(post) {
  const i = courseIndex(post);
  if (i >= 0) {
    const ordered = orderedCourse();
    return i > 0 ? ordered[i - 1] : null;
  }
  return dateEarlier(post);
}

function nextPost(post) {
  const i = courseIndex(post);
  if (i >= 0) {
    const ordered = orderedCourse();
    return i < ordered.length - 1 ? ordered[i + 1] : null;
  }
  return dateLater(post);
}

hexo.on('generateBefore', function () {
  orderedCache = null;
  hexo.extend.helper.register('prev_post', prevPost);
  hexo.extend.helper.register('next_post', nextPost);
});
