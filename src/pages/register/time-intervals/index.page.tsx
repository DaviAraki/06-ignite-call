import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../../lib/axios'
import { convertTimeStringToMinutes } from '../../../utils/convertTimeStringToMinutes'
import { getWeekdays } from '../../../utils/getWeekDays'
import { Container, Header } from '../styles'
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      })
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Selecione pelo menos um dia da semana',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekday,
          startTimeInMinutes: convertTimeStringToMinutes(interval.start),
          endTimeInMinutes: convertTimeStringToMinutes(interval.end),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início.',
      }
    ),
})

type TimeIntervalFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TimeIntervalFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekday: 0, enabled: false, start: '08:00', end: '18:00' },
        { weekday: 1, enabled: true, start: '08:00', end: '18:00' },
        { weekday: 2, enabled: true, start: '08:00', end: '18:00' },
        { weekday: 3, enabled: true, start: '08:00', end: '18:00' },
        { weekday: 4, enabled: true, start: '08:00', end: '18:00' },
        { weekday: 5, enabled: true, start: '08:00', end: '18:00' },
        { weekday: 6, enabled: false, start: '08:00', end: '18:00' },
      ],
    },
  })

  const router = useRouter()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const weekdays = getWeekdays()

  const intervals = watch('intervals')

  async function handleTimeIntervalsSubmit(data: any) {
    const { intervals } = data as TimeIntervalFormOutput

    await api.post('users/time-intervals', { intervals })

    await router.push('/register/update-profile')
  }

  return (
    <Container>
      <Header>
        <Heading as='strong'>Quase lá!</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />

        <IntervalBox
          as='form'
          onSubmit={handleSubmit(handleTimeIntervalsSubmit)}
        >
          <IntervalsContainer>
            {fields.map((field, index) => (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Checkbox
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true)
                          }}
                          checked={field.value}
                        />
                      )
                    }}
                  />

                  <Text>{weekdays[field.weekday]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size='sm'
                    type='time'
                    step={60}
                    disabled={!intervals[index].enabled}
                    {...register(`intervals.${index}.start`)}
                  />
                  <TextInput
                    size='sm'
                    type='time'
                    step={60}
                    disabled={!intervals[index].enabled}
                    {...register(`intervals.${index}.end`)}
                  />
                </IntervalInputs>
              </IntervalItem>
            ))}
          </IntervalsContainer>

          {errors.intervals && (
            <FormError color='red' size='sm'>
              {errors.intervals.message}
            </FormError>
          )}
          <Button type='submit' disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </IntervalBox>
      </Header>
    </Container>
  )
}
