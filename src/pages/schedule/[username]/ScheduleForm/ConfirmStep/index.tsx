import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text, TextArea, TextInput } from '@ignite-ui/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { CalendarBlank, Clock } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../../../../lib/axios'
import { ConfirmForm, FormActions, FormError, FormHeader } from './styles'

const confirmFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome precisa no mínimo 3 caracteres' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  observations: z.string().max(500).nullable(),
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>

interface ConfirmStepProps {
  schedulingDate: Date
  handleClearSelectedDateTime: () => void
}

export function ConfirmStep({
  schedulingDate,
  handleClearSelectedDateTime,
}: ConfirmStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  })

  const router = useRouter()
  const username = String(router.query.username)

  async function handleConfirmScheduling(data: ConfirmFormData) {
    const { email, name, observations } = data
    await api.post(`/users/${username}/schedule`, {
      date: schedulingDate,
      email,
      name,
      observations,
    })

    handleClearSelectedDateTime()
  }

  const describedDate = dayjs(schedulingDate).format('DD [de] MMMM [de] YYYY')
  const describedTime = dayjs(schedulingDate).format('HH:mm')

  return (
    <ConfirmForm as='form' onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {describedDate}
        </Text>
        <Text>
          <Clock />
          {describedTime}
        </Text>
      </FormHeader>

      <label>
        <Text size='sm'> Nome Completo</Text>
        <TextInput placeholder='Seu nome' {...register('name')} />
        {errors.name && <FormError size='sm'>{errors.name.message}</FormError>}
      </label>
      <label>
        <Text size='sm'> Endereço de e-mail</Text>
        <TextInput
          type='email'
          placeholder='seu@email.com'
          {...register('email')}
        />
        {errors.email && (
          <FormError size='sm'>{errors.email.message}</FormError>
        )}
      </label>
      <label>
        <Text size='sm'> Observações </Text>
        <TextArea {...register('observations')} />
      </label>

      <FormActions>
        <Button
          type='button'
          variant='tertiary'
          onClick={handleClearSelectedDateTime}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          Confirmar
        </Button>
      </FormActions>
    </ConfirmForm>
  )
}
