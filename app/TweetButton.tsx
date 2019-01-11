import * as React from 'react';

export interface Props {
  text: string;
  url: string;
}

export function TweetButton({ text, url }: Props) {
  const params = new URLSearchParams();
  params.set('text', text);
  params.set('url', url);

  const tweetUrl = 'https://twitter.com/intent/tweet?' + params.toString();

  return (
    <a href={tweetUrl} target="_blank" className="link">
      <div>tweet</div>
    </a>
  );
}
