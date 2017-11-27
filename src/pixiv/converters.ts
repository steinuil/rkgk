import * as raw from "./raw-types";
import * as t   from "./types";


export const MyInfo = (r: raw.Login): t.MyInfo => {
  const user = r.response.user;
  return {
    name: user.account,
    nick: user.name,
    id: parseInt(user.id),
    email: user.main_address,
    avatar: {
      big: user.profile_image_urls.px_170x170,
      medium: user.profile_image_urls.px_50x50,
      small: user.profile_image_urls.px_16x16
    }
  };
};

export const Work = (w: raw.Work): t.Work => {
  return {
    id: w.id,
    title: w.title,
    caption: w.caption,
    date: new Date(w.create_date),
    userId: w.user.id,
    pages: w.page_count,
    tags: w.tags.map(x => x.name),
    thumbnail: w.image_urls.square_medium,
    bookmarked: w.is_bookmarked
  };
};

export const Illust = (i: raw.Illust): t.Illust => {
  let illust = Work(i) as t.Illust;
  illust.tools = i.tools;
  illust.dimensions = [i.width, i.height];
  illust.type = i.type;

  if (i.meta_single_page) {
    illust.images = [i.meta_single_page.original_image_url];
  } else if (i.meta_pages) {
    illust.images = i.meta_pages.map(x => x.original);
  }

  illust.sexualContent = i.sanity_level / 2;

  return illust;
};
