import Link from 'next/link'
import * as S from './styled'
import Image from 'next/image'
import { useState } from 'react'
const ContactButton = () => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/5566997188890?text=Ol%C3%A1,%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <S.ButtonContainer>
      {/* Botão WhatsApp - sempre visível */}
      <button
        className="btn-wapp"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Abrir chat no WhatsApp"
      >
        <Image
          className="demo-handle"
          src="/assets/icons/icons-whatsapp.svg"
          alt="Mouse Hover"
          width={40}
          height={40}
        />
      </button>
    </S.ButtonContainer>
  )
}

export default ContactButton
