import Image from 'next/image'

import * as S from './styled'

const PostBlog = ({
  slug,
  date,
  timeToRead,
  title,
  description,
  main_class,
  image
}) => {
  return (
    <S.PostLink href={slug}>
      <S.PostWrapper>
        <S.PostImage>
          {image && (
            <Image
              src={image}
              alt="Banner da publicação"
              fill
              sizes="(max-width: 1024px) 100px, 150px"
              style={{ objectFit: 'cover' }}
            />
          )}
          {main_class && (
            <S.PostTag className={`is-${main_class}`}>{main_class}</S.PostTag>
          )}
        </S.PostImage>
        <S.PostInfo>
          <S.PostDate>
            {date} {timeToRead ?? timeToRead}
          </S.PostDate>
          <S.PostTitle>{title}</S.PostTitle>
          <S.PostDescription>{description}</S.PostDescription>
        </S.PostInfo>
      </S.PostWrapper>
    </S.PostLink>
  )
}

export default PostBlog
