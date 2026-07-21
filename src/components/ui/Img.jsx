import { useState } from 'react'

const FALLBACK = 'https://picsum.photos/600/600?blur=2'

/** Lazy image with shimmer skeleton + graceful fallback. */
export default function Img ({ src, alt = '', className = '', ...rest }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={`relative block overflow-hidden ${!loaded ? 'img-skeleton' : ''}`}>
      <img
        src={src}
        alt={alt}
        loading='lazy'
        decoding='async'
        onLoad={() => setLoaded(true)}
        onError={e => {
          if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK
        }}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...rest}
      />
    </span>
  )
}
