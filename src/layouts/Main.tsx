import React from 'react'
import { ConfigProvider, App, Layout, Menu, Badge, Avatar, Typography, Space, theme } from 'antd'
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

const pizzerIATheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#c0392b',          // Tomato red — PizzerIA's "Rosso Corsa"
    colorPrimaryHover: '#9d2211',     // Darker on hover
    colorPrimaryActive: '#7b241c',    // Press state
    colorPrimaryBg: 'rgba(192,57,43,0.08)',

    colorBgBase: '#181818',           // Near-black canvas — never pure black
    colorBgContainer: '#1e1e1e',      // Cards, panels (canvas-elevated)
    colorBgElevated: '#252525',       // Modals, dropdowns
    colorBgLayout: '#141414',         // Page layout floor
    colorBgSpotlight: '#2a2a2a',

    colorText: '#ffffff',             // Ink on dark
    colorTextSecondary: '#969696',    // Body muted (design.md colors.body)
    colorTextTertiary: '#666666',     // Captions / subtitles (colors.muted)
    colorTextQuaternary: '#444444',   // Disabled
    colorTextLightSolid: '#ffffff',

    colorBorder: '#303030',           // Hairline on dark (colors.hairline)
    colorBorderSecondary: '#252525',
    colorSplit: '#303030',

    colorSuccess: '#03904a',          // design.md colors.semantic-success
    colorWarning: '#f13a2c',          // colors.semantic-warning
    colorError: '#c0392b',
    colorInfo: '#4c98b9',             // colors.semantic-info

    // ── Sharp corners — brand precision (design.md: rounded.none = 0px) ──────
    // antd enforces a minimum of ~2px internally; true 0 is set per-component
    borderRadius: 2,
    borderRadiusLG: 2,
    borderRadiusSM: 2,
    borderRadiusXS: 2,

    // ── Typography ───────────────────────────────────────────────────────────
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    fontSize: 14,                     // typography.body-md
    fontSizeLG: 16,
    fontSizeXL: 18,
    fontSizeHeading1: 36,             // typography.display-lg
    fontSizeHeading2: 26,             // typography.display-md
    fontSizeHeading3: 18,             // typography.title-md
    fontWeightStrong: 500,            // design.md: display weight stays at 500

    // ── Spacing (8px ladder: xxxs 4 / xxs 8 / xs 16 / sm 24 / md 32 …) ──────
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,

    // ── Motion ───────────────────────────────────────────────────────────────
    motionDurationMid: '0.18s',
    motionDurationSlow: '0.25s',
    motionEaseInOut: 'cubic-bezier(0.16, 1, 0.3, 1)',

    // ── Control heights ──────────────────────────────────────────────────────
    controlHeight: 40,
    controlHeightLG: 48,              // design.md button height = 48px
    controlHeightSM: 32,

    // ── Links ────────────────────────────────────────────────────────────────
    colorLink: '#c0392b',
    colorLinkHover: '#9d2211',
    colorLinkActive: '#7b241c',

    // ── Shadows — single soft tier (design.md: no shadow tiers) ─────────────
    boxShadow: '0 4px 8px rgba(0,0,0,0.18)',
    boxShadowSecondary: '0 2px 4px rgba(0,0,0,0.12)',
  },
  components: {
    Layout: {
      siderBg: '#141414',
      headerBg: '#181818',
      footerBg: '#0e0e0e',
      triggerBg: '#0e0e0e',
      triggerColor: '#969696',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemHoverColor: '#ffffff',
      darkItemSelectedColor: '#ffffff',
      darkItemSelectedBg: 'rgba(192,57,43,0.18)',   // subtle red tint on selection
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      darkSubMenuItemBg: '#141414',
      itemBorderRadius: 0,                           // sharp nav items
      itemHeight: 44,                                // 44px WCAG touch target
      iconSize: 16,
      fontSize: 13,                                  // typography.nav-link size
    },
    Button: {
      primaryColor: '#ffffff',
      borderRadius: 0,                               // sharp CTA — brand signature
      borderRadiusLG: 0,
      borderRadiusSM: 0,
      fontWeight: 700,
      paddingInline: 32,
      paddingInlineLG: 40,
      contentFontSize: 14,
    },
    Input: {
      colorBgContainer: '#1e1e1e',
      colorBorder: '#303030',
      colorText: '#ffffff',
      activeBorderColor: '#c0392b',
      hoverBorderColor: '#7b241c',
      borderRadius: 0,
    },
    Card: {
      colorBgContainer: '#1e1e1e',
      colorBorderSecondary: '#303030',
      borderRadius: 0,
      borderRadiusLG: 0,
      headerBg: '#252525',
    },
    Badge: { colorBgContainer: '#c0392b' },
    Avatar: { colorBgContainer: '#7b241c' },
    Table: {
      colorBgContainer: '#1e1e1e',
      headerBg: '#252525',
      headerColor: '#969696',
      rowHoverBg: '#252525',
      borderColor: '#303030',
      borderRadius: 0,
    },
    Dropdown: { colorBgElevated: '#252525', borderRadius: 2 },
    Modal: { contentBg: '#1e1e1e', headerBg: '#1e1e1e', borderRadiusLG: 2 },
    Select: {
      colorBgContainer: '#1e1e1e',
      colorBorder: '#303030',
      colorText: '#ffffff',
      selectorBg: '#1e1e1e',
      optionSelectedBg: 'rgba(192,57,43,0.18)',
      borderRadius: 0,
    },
    Tag: {
      // design.md: pill geometry reserved for badge labels only (rounded.full)
      borderRadiusSM: 9999,
      colorBgContainer: '#252525',
      colorText: '#ffffff',
      colorBorder: '#303030',
      fontSize: 11,
    },
    Tabs: {
      inkBarColor: '#c0392b',
      itemSelectedColor: '#ffffff',
      itemColor: '#969696',
      itemHoverColor: '#ffffff',
    },
    Breadcrumb: {
      itemColor: '#969696',
      lastItemColor: '#ffffff',
      separatorColor: '#444444',
      linkColor: '#969696',
      linkHoverColor: '#c0392b',
      fontSize: 13,
    },
    Typography: {
      colorText: '#ffffff',
      colorTextSecondary: '#969696',
      fontWeightStrong: 500,
    },
    Divider: { colorSplit: '#303030' },
    Notification: { colorBgElevated: '#252525', colorText: '#ffffff', borderRadiusLG: 2 },
    Message: { colorBgElevated: '#252525', colorText: '#ffffff' },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Logo (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const PizzerIALogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 20px 12px',
      borderBottom: '1px solid #303030',
      marginBottom: 8,
    }}
  >
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="PizzerIA logo" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="15" fill="#c0392b" />
      <path d="M16 3 L29 26 L3 26 Z" fill="#e8cfa0" />
      <path d="M16 3 L29 26 L3 26 Z" fill="none" stroke="#c0392b" strokeWidth="1.5" />
      <circle cx="16" cy="18" r="2.5" fill="#922b21" />
      <circle cx="11" cy="22" r="2" fill="#922b21" />
      <circle cx="21" cy="22" r="2" fill="#922b21" />
      <path d="M3 26 Q16 30 29 26" stroke="#b5651d" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
    {!collapsed && (
      <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: 20, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>
        PizzerIA
      </span>
    )}
  </div>
)

const navItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Home' },
  { key: '/whiteboard', icon: <FormOutlined />, label: 'Whiteboard' },
  { key: '/orders', icon: <HistoryOutlined />, label: 'Orders' },
  { key: '/team', icon: <TeamOutlined />, label: 'Team' },
]

interface PizzerIALayoutProps {
  children: React.ReactNode
  activeKey?: string
  onNavigate?: (key: string) => void
}

const PizzerIALayoutInner: React.FC<PizzerIALayoutProps> = ({ children, activeKey = '/', onNavigate }) => {
  const [collapsed, setCollapsed] = React.useState(true)

  return (
    <Layout style={{ minHeight: '100vh', background: '#141414' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ background: '#141414', borderRight: '1px solid #303030' }}
        trigger={
          <div style={{ background: '#0e0e0e', color: '#969696', fontSize: 16, lineHeight: '40px', letterSpacing: '0.65px', textTransform: 'uppercase' }}>
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
          theme="dark"
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Sider>

      <Layout style={{ background: '#181818' }}>
        <Header
          style={{
            background: '#181818',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #303030',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 64,
          }}
        >
          <Text style={{ color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.65px', textTransform: 'uppercase' }}>
            🍕 PizzerIA
          </Text>
          <Space size="middle">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#969696', cursor: 'pointer' }} />
            </Badge>
            <Avatar icon={<UserOutlined />} style={{ background: '#7b241c', cursor: 'pointer' }} />
          </Space>
        </Header>

        <Content style={{ background: '#181818', minHeight: 'calc(100vh - 64px - 48px)', overflow: 'auto' }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center', background: '#0e0e0e', borderTop: '1px solid #303030', color: '#666666', padding: '12px 24px', fontSize: 13, letterSpacing: '0.3px' }}>
          PizzerIA © {new Date().getFullYear()} - Sofía Baires, Fernando Rivera, Angel Castillo
        </Footer>
      </Layout>
    </Layout>
  )
}

export const PizzerIALayout: React.FC<PizzerIALayoutProps> = (props) => (
  <ConfigProvider theme={pizzerIATheme}>
    <App>
      <PizzerIALayoutInner {...props} />
    </App>
  </ConfigProvider>
)