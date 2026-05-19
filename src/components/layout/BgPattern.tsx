const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="90" viewBox="0 0 80 90"><path d="M40 8 L72 20 L72 55 C72 74 40 84 40 84 C40 84 8 74 8 55 L8 20 Z" fill="none" stroke="rgba(0,201,167,0.07)" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="14" fill="rgba(0,201,167,0.07)" font-family="sans-serif" font-weight="bold">GS</text></svg>`

const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`

export const BgPattern = () => (
  <div
    className="fixed inset-0 -z-10 pointer-events-none"
    style={{
      backgroundColor: '#F0F2F5',
      backgroundImage: `url("${dataUri}")`,
      backgroundSize: '120px 120px',
      backgroundRepeat: 'repeat',
    }}
  />
)

export default BgPattern
