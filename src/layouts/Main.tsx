import React from 'react'
import { Layout, Menu, Badge, Avatar, Typography, Space } from 'antd'
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

// ── Inline PizzerIA SVG Logo ─────────────────────────────────────────────────
const PizzerIALogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 20px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      marginBottom: 8,
    }}
  >
    {/* Pizza slice SVG mark */}
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="PizzerIA logo"
      style={{ flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="15" fill="#c0392b" />
      <path d="M16 3 L29 26 L3 26 Z" fill="#e8cfa0" />
      <path d="M16 3 L29 26 L3 26 Z" fill="none" stroke="#c0392b" strokeWidth="1.5" />
      {/* Pepperoni */}
      <circle cx="16" cy="18" r="2.5" fill="#922b21" />
      <circle cx="11" cy="22" r="2" fill="#922b21" />
      <circle cx="21" cy="22" r="2" fill="#922b21" />
      {/* Crust */}
      <path d="M3 26 Q16 30 29 26" stroke="#b5651d" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
    {!collapsed && (
      <span
        style={{
          fontFamily: "'Georgia', serif",
          fontWeight: 700,
          fontSize: 20,
          color: '#fff',
          letterSpacing: '-0.3px',
          lineHeight: 1,
        }}
      >
        PizzerIA
      </span>
    )}
  </div>
)

// ── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Home' },
  { key: '/whiteboard', icon: <FormOutlined />, label: 'Whiteboard' },
  { key: '/orders', icon: <HistoryOutlined />, label: 'Orders' },
  { key: '/team', icon: <TeamOutlined />, label: 'Team' },
]

// ── Ant Design token overrides for the red pizza theme ───────────────────────
// Use ConfigProvider in your app root with these values:
// colorPrimary: '#c0392b'
// colorBgContainer: '#fff'
// See App.tsx / main.tsx example at the bottom of this file.

interface PizzerIALayoutProps {
  children: React.ReactNode
  /** Active nav key — pass the current route path */
  activeKey?: string
  onNavigate?: (key: string) => void
}

export const PizzerIALayout: React.FC<PizzerIALayoutProps> = ({
  children,
  activeKey = '/',
  onNavigate,
}) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: '#922b21',        // deep pizza-red
          boxShadow: '2px 0 8px rgba(0,0,0,0.18)',
        }}
        trigger={
          <div
            style={{
              background: '#7b241c',
              color: '#fff',
              fontSize: 16,
              lineHeight: '40px',
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
          style={{
            background: 'transparent',
            borderRight: 'none',
            color: 'rgba(255,255,255,0.85)',
          }}
          theme="dark"
        />
      </Sider>

      <Layout>
        {/* ── Top Header ── */}
        <Header
          style={{
            background: '#c0392b',    // vibrant tomato red
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Breadcrumb / page title area */}
          <Text
            style={{
              color: '#fff',
              fontFamily: "'Georgia', serif",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            🍕 PizzerIA — AI Whiteboard
          </Text>

          {/* Right actions */}
          <Space size="middle">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }} />
            </Badge>
            <Avatar
              icon={<UserOutlined />}
              style={{ background: '#7b241c', cursor: 'pointer' }}
            />
          </Space>
        </Header>

        {/* ── Main Content ── */}
        <Content
          style={{
            background: '#fdf6f0',   // warm off-white — like fresh dough
            minHeight: 'calc(100vh - 64px - 48px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>

        {/* ── Footer ── */}
        <Footer
          style={{
            textAlign: 'center',
            background: '#922b21',
            color: 'rgba(255,255,255,0.7)',
            padding: '12px 24px',
            fontSize: 13,
          }}
        >
          PizzerIA © {new Date().getFullYear()} — Crafted with 🍕 & AI
        </Footer>
      </Layout>
    </Layout>
  )
}