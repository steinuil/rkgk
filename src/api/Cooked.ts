/** @summary Functions from raw server items to the client items. */

/** @ignore */
import * as Raw from './Raw';
import { MyInfo, User, UserPreview, Illust, Live, Novel, Work } from './Items';

export const myInfo = (r: Raw.Login): MyInfo => {
  const user = r.response.user;
  return {
    name: user.account,
    nick: user.name,
    id: parseInt(user.id),
    email: user.mail_address,
    avatar: {
      big: user.profile_image_urls.px_170x170,
      medium: user.profile_image_urls.px_50x50,
      small: user.profile_image_urls.px_16x16,
    },
  };
};

export const user = (u: Raw.User): User => ({
  id: u.id,
  accountName: u.account,
  displayName: u.name,
  avatar: u.profile_image_urls.medium,
  description: u.comment || null,
  followed: u.is_followed || null,
});

export const work = (w: Raw.Work): Work => ({
  id: w.id,
  title: w.title,
  caption: w.caption,
  date: new Date(w.create_date),
  user: user(w.user),
  pages: w.page_count,
  tags: w.tags.map((x) => x.name),
  thumbnail: w.image_urls.square_medium,
  bookmarked: w.is_bookmarked,
});

export const illust = (i: Raw.Illust): Illust => {
  let illust = work(i) as Illust;
  illust.tools = i.tools;
  illust.dimensions = [i.width, i.height];
  illust.type = i.type;

  if (i.meta_single_page.original_image_url) {
    illust.images = [i.meta_single_page.original_image_url];
  } else {
    illust.images = i.meta_pages!.map((x) => x.image_urls.original);
  }

  illust.sexualContent = i.sanity_level / 2 - 1;

  return illust;
};

export const novel = (n: Raw.Novel): Novel => {
  let novel = work(n) as Novel;
  novel.length = n.text_length;
  novel.series = n.series;
  return novel;
};

export const userPreview = (u: Raw.UserPreview): UserPreview => ({
  user: user(u.user),
  illusts: u.illusts.map((i) => illust(i)),
  novels: u.novels.map((n) => novel(n)),
  muted: u.is_muted,
});

export const live = (l: Raw.Live): Live => ({
  id: parseInt(l.id),
  channelId: l.channel_id,
  name: l.name,
  owner: user(l.owner.user),
  performers: l.performers.map((i) => user(i.user)),
  performerCount: l.performer_count,
  created: new Date(l.created_at),
  closed: l.is_closed,
  micEnabled: l.is_enabled_mic_input,
  muted: l.is_muted,
  r15: l.is_r15,
  r18: l.is_r18,
  adult: l.is_adult,
  single: l.is_single,
  members: l.member_count,
  viewers: l.total_audience_count,
  mode: l.mode,
  server: l.server,
  thumbnail: l.thumbnail_image_url,
});
