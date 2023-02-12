interface Window {
  _AMapSecurityConfig: {
    securityJsCode: string
  }
  QC: {
    Login: {
      // qq是否登陆过
      check(): boolean
      // 获取个人信息
      getMe(cb: (openId: string) => void): void
    }
  }
}
