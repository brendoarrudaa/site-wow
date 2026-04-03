import { useState } from 'react'

import SidebarBlog from 'components/SidebarBlog'
import MenuBar from 'components/MenuBar'
import Header from 'components/Header'
import FooterBlog from 'components/FooterBlog'

import * as S from './styled'
import Drawer from 'components/Drawer'

const BlogLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOpen, setOpen] = useState(false)

  return (
    <S.LayoutWrapper>
      <Header isOpen={isOpen} setOpen={setOpen} />
      <MenuBar />
      <S.LayoutMain>
        {children}
        <Drawer isOpen={isOpen} setOpen={setOpen} />
        <FooterBlog />
      </S.LayoutMain>
      <SidebarBlog setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
    </S.LayoutWrapper>
  )
}

export default BlogLayout
