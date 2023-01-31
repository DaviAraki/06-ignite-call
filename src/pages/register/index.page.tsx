import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { Container, Form, FormError, Header } from './styles'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { api } from '@/lib/axios'
import { AxiosError } from 'axios'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O nome de usuário deve ter no mínimo 3 caracteres' })
    .max(20, { message: 'O nome de usuário deve ter no máximo 20 caracteres' })
    .regex(/^[a-z0-9\\-]+$/i, {
      message: 'O nome de usuário deve conter apenas letras, números e hífens',
    })
    .transform((username) => username.toLowerCase()),

  name: z
    .string()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    setValue('username', String(router.query?.username))
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        username: data.username,
        name: data.name,
      })

      await router.push('/register/connect-calendar')
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
        return
      }
      console.error(err)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as='strong'>Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          alterar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
        <Form as='form' onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size='sm'>Nome de usuário</Text>
            <TextInput
              prefix='call.com/'
              placeholder='seu-usuario'
              {...register('username')}
            />
            {errors.username && (
              <FormError size='sm'>{errors.username.message}</FormError>
            )}
          </label>
          <label>
            <Text size='sm'>Nome completo</Text>
            <TextInput placeholder='seu-nome' {...register('name')} />
            {errors.name && (
              <FormError size='sm'>{errors.name.message}</FormError>
            )}
          </label>

          <Button type='submit' disabled={isSubmitting}>
            Próximo passo <ArrowRight />
          </Button>
        </Form>
      </Header>
    </Container>
  )
}
