import Link from 'next/link'
import * as S from './styled'
import { PeopleTeamAdd } from '@styled-icons/fluentui-system-filled/PeopleTeamAdd'
import { Robot } from '@styled-icons/bootstrap/Robot'
import { AppSettingsAlt } from '@styled-icons/material-twotone/AppSettingsAlt'
import { Devices } from '@styled-icons/boxicons-regular/Devices'
import { DesignIdeas } from '@styled-icons/fluentui-system-regular/DesignIdeas'
import { TestTube } from '@styled-icons/boxicons-regular/TestTube'
import { Home } from 'styled-icons/boxicons-regular'
const Drawer = ({ isOpen, setOpen }) => {
  return (
    <S.DrawerContainer $isOpen={isOpen}>
      <ul className="menu bg-base-100 w-56 ">
        <li>
          <Link href="/">Inicio</Link>
        </li>
        <div className="dropdown">
          <label tabIndex={0}>
            Nossos serviços
            <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link href="/servicos/outsourcing">
                <PeopleTeamAdd size={24} color="#8257e6" />
                Outsourcing
              </Link>
            </li>
            <li>
              <Link href="/servicos/inteligencia-artificial">
                <Robot size={24} color="#8257e6" />
                Inteligência Artificial
              </Link>
            </li>
            <li>
              <Link href="/servicos/desenvolvimento-de-aplicativos">
                <AppSettingsAlt size={24} color="#8257e6" />
                Aplicativos Mobile
              </Link>
            </li>
            <li>
              <Link href="/servicos/desenvolvimento-web">
                <Devices size={24} color="#8257e6" />
                Desenvolvimento Web
              </Link>
            </li>
            <li>
              <Link href="/servicos/ux-ui-design">
                <DesignIdeas size={24} color="#8257e6" />
                Product Design
              </Link>
            </li>
            <li>
              <Link href="/servicos/quality-assurance">
                <TestTube size={24} color="#8257e6" />
                Quality Assurance
              </Link>
            </li>
          </ul>
        </div>
        <li
          className="bordered"
          onClick={() => {
            document?.querySelector('.swap')?.click()
            setOpen(false)
          }}
        >
          <Link href="/#clients">Cases</Link>
        </li>
        <li
          className="bordered"
          onClick={() => {
            document?.querySelector('.swap')?.click()
            setOpen(false)
          }}
        >
          <Link href="/#about">Sobre</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/#contato">Fale com a gente</Link>
        </li>
      </ul>
    </S.DrawerContainer>
  )
}

export default Drawer
