import { OmvTileDecoder } from 'app/arca/omv-datasource/index-worker'
import { OmvDataSource } from 'app/arca/omv-datasource/OmvDataSource'
import { APIFormat, AuthenticationMethod } from 'app/arca/vectortile-datasource'

export const defaultOmvDataSource = new OmvDataSource({
  baseUrl: 'https://vector.hereapi.com/v2/vectortiles/base/mc',
  apiFormat: APIFormat.XYZOMV,
  styleSetName: 'tilezen',
  maxDataLevel: 3,
  authenticationCode: '_ZQeCfAB3nJFJ4E7JJ7W-CwSSW3vvUh6032RY85_OVs',
  authenticationMethod: {
    method: AuthenticationMethod.QueryString,
    name: 'apikey',
  },
  copyrightInfo: [
    {
      id: 'here.com',
      year: new Date().getFullYear(),
      label: 'HERE',
      link: 'https://legal.here.com/terms',
    },
  ],
  decoder: new OmvTileDecoder(),
  // addGroundPlane: true,
})
