import { useEffect, useState } from 'react'
import Drawer from 'components/Drawer'
import Header from 'components/Header'
import ContactButton from 'components/ContactButton'
import * as S from './styled'
import Footer from 'components/FooterMoviSul'

const Layout = ({ children }) => {
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    animateContactBtn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const animateContactBtn = () => {
    const btns = document.querySelectorAll('#btn-contact')

    setTimeout(function () {
      btns.forEach(btn => {
        btn.classList.add('btn-contact-active')
      })
      setTimeout(function () {
        btns.forEach(btn => {
          btn.classList.remove('btn-contact-active')
        })
        animateContactBtn()
      }, 100)
    }, 5000)
  }

  return (
    <S.LayoutWrapper>
      <Header isOpen={isOpen} setOpen={setOpen} />
      <S.LayoutMain>
        {children}
        <Drawer isOpen={isOpen} setOpen={setOpen} />
        <ContactButton />
      </S.LayoutMain>
    </S.LayoutWrapper>
  )
}

export default Layout
