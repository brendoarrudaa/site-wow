import Image from 'next/image'

import * as S from './styled'
import Link from 'next/link'

const AdBlog = ({ name, url }) => {
  return (
    <Link href="/#contato">
      <S.AdBlogWrapper>
        <Image
          src={url}
          alt={`Anuncio de ${name} da Movisul`}
          width={270}
          height={270}
          loading="eager"
        />
      </S.AdBlogWrapper>
    </Link>
  )
}

export default AdBlog
