/* global hexo */
'use strict';

// Make the Fluid theme's prev/next post links follow course READING ORDER
// instead of Hexo's global date order -- without changing any URLs (URLs are
// derived from the post date, so re-dating is not an option).
//
// For every post whose slug looks like `ai-agent-fables-NN-...`:
//   lesson  = NN
//   chapter = the digit in `-chM-` (overview posts have no `-chM-` => 0)
// Posts are chained 01.0 -> 01.1 -> ... -> 01.6 -> 02.0 -> 02.1 -> ... so an
// overview's 下一篇 is its own chapter 1, and a lesson's last chapter links to
// the next lesson's overview.
//
// Software-quality fable/xianxia posts are chained by their leading NN number:
//   software-quality-xianxia-00 -> ... -> software-quality-xianxia-09
//   software-quality-fables-00  -> ... -> software-quality-fables-09
//
// Single-track course posts such as `gaokao-coding-NN-...` and
// `ai-maker-NN-...` are chained by their leading NN number.
//
// Non-course posts fall back to date order, with the chronologically earlier
// post on the left (上一篇) and the later one on the right (下一篇). Hexo's
// `page.prev` is the newer post and `page.next` the older one, so we swap them.
//
// The theme registers prev_post/next_post when its scripts load, which happens
// after this site script, so we (re)register on `generateBefore` to win.

let orderedCache = null;

function courseKey(post) {
  const slug = (post && post.slug) || '';
  let m = slug.match(/^ai-agent-fables-(\d{2})-(.+)$/);
  if (m) {
    const chMatch = m[2].match(/^ch(\d+)-/);
    return {
      course: 'ai-agent-fables',
      lesson: parseInt(m[1], 10),
      chapter: chMatch ? parseInt(chMatch[1], 10) : 0
    };
  }

  m = slug.match(/^(gaokao-coding|ai-maker)-(\d{2})-/);
  if (m) {
    return {
      course: m[1],
      lesson: parseInt(m[2], 10),
      chapter: 0
    };
  }

  m = slug.match(/^software-quality-(xianxia|fables)-(\d{2})-/);
  if (!m) {
    return null;
  }

  return {
    course: 'software-quality-' + m[1],
    lesson: parseInt(m[2], 10),
    chapter: 0
  };
}

function orderedCourse(course) {
  if (!orderedCache) {
    orderedCache = {};
  }
  if (orderedCache[course]) {
    return orderedCache[course];
  }
  orderedCache[course] = hexo.locals.get('posts').toArray()
    .map(function (p) { return { post: p, key: courseKey(p) }; })
    .filter(function (x) { return x.key && x.key.course === course; })
    .sort(function (a, b) {
      return a.key.lesson - b.key.lesson || a.key.chapter - b.key.chapter;
    })
    .map(function (x) { return x.post; });
  return orderedCache[course];
}

function courseIndex(post) {
  const key = courseKey(post);
  if (!key) {
    return -1;
  }
  const ordered = orderedCourse(key.course);
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
    const ordered = orderedCourse(courseKey(post).course);
    return i > 0 ? ordered[i - 1] : null;
  }
  return dateEarlier(post);
}

function nextPost(post) {
  const i = courseIndex(post);
  if (i >= 0) {
    const ordered = orderedCourse(courseKey(post).course);
    return i < ordered.length - 1 ? ordered[i + 1] : null;
  }
  return dateLater(post);
}

hexo.on('generateBefore', function () {
  orderedCache = null;
  hexo.extend.helper.register('prev_post', prevPost);
  hexo.extend.helper.register('next_post', nextPost);
});
