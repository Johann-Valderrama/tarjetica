'use client'

import { useTranslations } from 'next-intl'
import { VistaTarjeta } from './tarjeta'
import { QrDeContacto } from '../qr/qr-cliente'

/** Perfil ficticio independiente del almacenamiento del visitante. */
export function MuestraTarjeta() {
  const t = useTranslations('home')
  const tarjeta = {
    n: 'Alex', a: 'Rivera', c: t('ejemploCargo'), em: 'Estudio Norte',
    d: t('ejemploCiudad'), ti: t('ejemploTitular'),
    co: 'alex@example.com',
  }
  return <VistaTarjeta muestra tarjeta={tarjeta} qr={<QrDeContacto tarjeta={tarjeta} />} />
}
