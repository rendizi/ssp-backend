
interface LoginResponse{
    UserType: number
    Email: string 
    ShortName: string 
    FullName: string 
    Klass: string 
    School: string 
    PhotoUrl: string 
}

interface AdditionalResponse{
    success: boolean
    data: {
        PhotoUrl: string
        Klass: string
        School: {
            Gid: string
            Name: {
                kk: string
                ru: string
                en: string
            }
        }
    Children: never
  }
}