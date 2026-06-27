// src/components/PizzerIALayout.tsx (or wherever your layout lives)

import React from 'react'
import {
  ConfigProvider,
  App,
  Layout,
  Menu,
  Badge,
  Avatar,
  Typography,
  Space,
  theme,
} from 'antd'
import {
  HomeOutlined,
  FormOutlined,
  HistoryOutlined,
  TeamOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

// ─── Light-themed PizzerIA token set ─────────────────────────────────────────
const pizzerIATheme = {
  algorithm: theme.defaultAlgorithm,   // ← light algorithm
  token: {
    colorPrimary: '#c0392b',
    colorPrimaryHover: '#9d2211',
    colorPrimaryActive: '#7b241c',
    colorPrimaryBg: 'rgba(192,57,43,0.07)',

    // Warm parchment surfaces
    colorBgBase: '#f7f4ee',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#fdfaf6',
    colorBgLayout: '#f2ede6',
    colorBgSpotlight: '#ede8e0',

    // Dark ink on light
    colorText: '#2d2820',
    colorTextSecondary: '#7a6e5e',
    colorTextTertiary: '#a09880',
    colorTextQuaternary: '#c8bfb0',
    colorTextLightSolid: '#ffffff',

    colorBorder: '#e0d8cd',
    colorBorderSecondary: '#ede8e0',
    colorSplit: '#e8e3da',

    colorSuccess: '#437a22',
    colorWarning: '#da7101',
    colorError: '#c0392b',
    colorInfo: '#006494',

    // Sharp corners — brand precision
    borderRadius: 2,
    borderRadiusLG: 2,
    borderRadiusSM: 2,
    borderRadiusXS: 2,

    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 18,
    fontSizeHeading1: 36,
    fontSizeHeading2: 26,
    fontSizeHeading3: 18,
    fontWeightStrong: 500,

    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,

    motionDurationMid: '0.18s',
    motionDurationSlow: '0.25s',
    motionEaseInOut: 'cubic-bezier(0.16, 1, 0.3, 1)',

    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    colorLink: '#c0392b',
    colorLinkHover: '#9d2211',
    colorLinkActive: '#7b241c',

    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    boxShadowSecondary: '0 2px 6px rgba(0,0,0,0.05)',
  },
  components: {
    Layout: {
      siderBg: '#f2ede6',
      headerBg: '#ffffff',
      footerBg: '#ede8e0',
      triggerBg: '#e8e3da',
      triggerColor: '#a09880',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#7a6e5e',
      itemHoverColor: '#2d2820',
      itemSelectedColor: '#c0392b',
      itemSelectedBg: 'rgba(192,57,43,0.08)',
      itemHoverBg: 'rgba(0,0,0,0.04)',
      subMenuItemBg: '#ede8e0',
      itemBorderRadius: 0,
      itemHeight: 44,
      iconSize: 16,
      fontSize: 13,
    },
    Button: {
      primaryColor: '#ffffff',
      borderRadius: 0,
      borderRadiusLG: 0,
      borderRadiusSM: 0,
      fontWeight: 700,
      paddingInline: 32,
      paddingInlineLG: 40,
      contentFontSize: 14,
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e0d8cd',
      colorText: '#2d2820',
      activeBorderColor: '#c0392b',
      hoverBorderColor: '#9d2211',
      borderRadius: 0,
      colorTextPlaceholder: '#b0a898',
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e0d8cd',
      borderRadius: 0,
      borderRadiusLG: 0,
      headerBg: '#faf8f4',
    },
    Badge: { colorBgContainer: '#c0392b' },
    Avatar: { colorBgContainer: '#9d2211' },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: '#faf8f4',
      headerColor: '#7a6e5e',
      rowHoverBg: '#fefcf8',
      borderColor: '#e8e3da',
      borderRadius: 0,
    },
    Dropdown: { colorBgElevated: '#ffffff', borderRadius: 2 },
    Modal: { contentBg: '#ffffff', headerBg: '#ffffff', borderRadiusLG: 2 },
    Select: {
      colorBgContainer: '#ffffff',
      colorBorder: '#e0d8cd',
      colorText: '#2d2820',
      selectorBg: '#ffffff',
      optionSelectedBg: 'rgba(192,57,43,0.07)',
      borderRadius: 0,
    },
    Tag: {
      borderRadiusSM: 9999,
      colorBgContainer: '#f3efe8',
      colorText: '#7a6e5e',
      colorBorder: '#e0d8cd',
      fontSize: 11,
    },
    Tabs: {
      inkBarColor: '#c0392b',
      itemSelectedColor: '#c0392b',
      itemColor: '#a09880',
      itemHoverColor: '#2d2820',
    },
    Breadcrumb: {
      itemColor: '#a09880',
      lastItemColor: '#2d2820',
      separatorColor: '#c8bfb0',
      linkColor: '#a09880',
      linkHoverColor: '#c0392b',
      fontSize: 13,
    },
    Typography: {
      colorText: '#2d2820',
      colorTextSecondary: '#7a6e5e',
      fontWeightStrong: 500,
    },
    Divider: { colorSplit: '#e8e3da' },
    Notification: {
      colorBgElevated: '#ffffff',
      colorText: '#2d2820',
      borderRadiusLG: 2,
    },
    Message: { colorBgElevated: '#ffffff', colorText: '#2d2820' },
  },
}

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
const PizzerIALogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 20px 12px',
      borderBottom: '1px solid #e8e3da',
      marginBottom: 8,
    }}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="PizzerIA logo"
      style={{ flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="15" fill="#c0392b" />
      <path d="M16 4 L28 25 L4 25 Z" fill="#f5deb3" />
      <path
        d="M16 4 L28 25 L4 25 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      <circle cx="16" cy="18" r="2.2" fill="#922b21" />
      <circle cx="11.5" cy="21.5" r="1.7" fill="#922b21" />
      <circle cx="20.5" cy="21.5" r="1.7" fill="#922b21" />
      <path
        d="M4 25 Q16 29.5 28 25"
        stroke="#b5651d"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
    {!collapsed && (
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 19,
          color: '#1e1a15',
          letterSpacing: '-0.3px',
          lineHeight: 1,
        }}
      >
        PizzerIA
      </span>
    )}
  </div>
)

const navItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Inicio' },
  { key: '/whiteboard', icon: <FormOutlined />, label: 'Pizarra' },
  { key: '/orders', icon: <HistoryOutlined />, label: 'Historial' },
  { key: '/team', icon: <TeamOutlined />, label: 'Equipo' },
]

interface PizzerIALayoutProps {
  children: React.ReactNode
  activeKey?: string
  onNavigate?: (key: string) => void
}

const PizzerIALayoutInner: React.FC<PizzerIALayoutProps> = ({
  children,
  activeKey = '/',
  onNavigate,
}) => {
  const [collapsed, setCollapsed] = React.useState(true)

  return (
    <Layout style={{ minHeight: '100vh', background: '#f2ede6' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: '#f2ede6',
          borderRight: '1px solid #e0d8cd',
          boxShadow: '1px 0 0 #e8e3da',
        }}
        trigger={
          <div
            style={{
              background: '#e8e3da',
              color: '#a09880',
              fontSize: 15,
              lineHeight: '40px',
              borderTop: '1px solid #ddd8d0',
            }}
          >
            {collapsed ? '›' : '‹'}
          </div>
        }
      >
        <PizzerIALogo collapsed={collapsed} />
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={navItems}
          onClick={({ key }) => onNavigate?.(key)}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Sider>

      <Layout style={{ background: '#f7f4ee' }}>
        <Header
          style={{
            background: '#ffffff',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0d8cd',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 64,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Inline pizza logo mark */}
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="15" fill="#c0392b" />
              <path d="M16 4 L28 25 L4 25 Z" fill="#f5deb3" />
              <circle cx="16" cy="18" r="2" fill="#922b21" />
              <circle cx="11.5" cy="21.5" r="1.5" fill="#922b21" />
              <circle cx="20.5" cy="21.5" r="1.5" fill="#922b21" />
            </svg>
            <Text
              style={{
                color: '#2d2820',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.4px',
              }}
            >
              PizzerIA
            </Text>
          </div>

          <Space size="middle">
            <Badge count={3} size="small">
              <BellOutlined
                style={{ fontSize: 18, color: '#a09880', cursor: 'pointer' }}
              />
            </Badge>
            <Avatar
              icon={<UserOutlined />}
              style={{ background: '#9d2211', cursor: 'pointer' }}
            />
          </Space>
        </Header>

        <Content
          style={{
            background: '#f7f4ee',
            minHeight: 'calc(100vh - 64px - 48px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            background: '#ede8e0',
            borderTop: '1px solid #e0d8cd',
            color: '#a09880',
            padding: '12px 24px',
            fontSize: 12,
            letterSpacing: '0.3px',
          }}
        >
          PizzerIA © {new Date().getFullYear()} — Sofía Baires, Fernando Rivera, Angel Castillo
        </Footer>
      </Layout>
    </Layout>
  )
}

export const PizzerIALayout: React.FC<PizzerIALayoutProps> = props => (
  <ConfigProvider theme={pizzerIATheme}>
    <App>
      <PizzerIALayoutInner {...props} />
    </App>
  </ConfigProvider>
)