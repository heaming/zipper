"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/ui/select"

function Calendar({
                    className,
                    classNames,
                    showOutsideDays = true,
                    captionLayout = "label",
                    buttonVariant = "ghost",
                    locale,
                    formatters,
                    components,
                    ...props
                  }: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-2 [--cell-radius:0.5rem] [--cell-size:1.75rem] bg-background group/calendar in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full max-w-full overflow-hidden", defaultClassNames.root),
        months: cn(
          "flex flex-col w-full gap-2",
          defaultClassNames.months
        ),
        month: cn(
          "relative flex flex-col w-full gap-4",
          defaultClassNames.month
        ),
        nav: cn(
          "absolute top-0 left-0 right-0 h-[var(--cell-size)] flex items-center justify-between px-2 z-10",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[var(--cell-size)] w-[var(--cell-size)] px-0 mt-4 flex items-center justify-center relative z-20",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[var(--cell-size)] w-[var(--cell-size)] px-0 mt-4 flex items-center justify-center relative z-20",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-[var(--cell-size)] relative z-0",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex items-center justify-center gap-1.5 h-[var(--cell-size)] relative z-0",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative inline-flex items-center",
          defaultClassNames.dropdown_root
        ),

        dropdown: cn(
          "absolute top-full left-0 w-full opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "cn-calendar-caption-label rounded-[var(--cell-radius)] flex items-center gap-1 text-sm  [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: defaultClassNames.weekdays,
        weekday: cn(
          "text-muted-foreground rounded-[var(--cell-radius)] flex-1 font-normal text-[0.8rem] select-none min-w-0",
          defaultClassNames.weekday
        ),
        week: cn("mt-1", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-[var(--cell-size)]",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative rounded-[var(--cell-radius)] p-0 text-center aspect-square",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-[var(--cell-radius)] bg-muted relative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:right-0 z-0 isolate",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "rounded-r-[var(--cell-radius)] bg-muted relative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:left-0 z-0 isolate",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-muted text-primary rounded-[var(--cell-radius)] data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("cn-rtl-flip size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("cn-rtl-flip size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[var(--cell-size)] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        Dropdown: (dropdownProps: any) => {
          const { name, value, onChange, options, ...props } = dropdownProps
          
          // react-day-picker의 onChange는 이벤트 객체를 받음
          const handleChange = React.useCallback((newValue: string) => {
            if (onChange && typeof onChange === 'function') {
              // react-day-picker가 기대하는 이벤트 객체 형식
              const syntheticEvent = {
                target: { 
                  value: newValue,
                  name: name
                },
                currentTarget: { 
                  value: newValue,
                  name: name
                },
                preventDefault: () => {},
                stopPropagation: () => {}
              } as React.ChangeEvent<HTMLSelectElement>
              
              onChange(syntheticEvent)
            }
          }, [onChange, name])
          
          // react-day-picker가 options를 제공하는 경우 사용
          if (options && Array.isArray(options) && options.length > 0) {
            const selectedOption = options.find((opt: any) => String(opt.value) === String(value))
            const displayValue = selectedOption ? selectedOption.label : value || ""
            
            return (
              <Select value={value || ""} onValueChange={handleChange}>
                <SelectTrigger className="h-[var(--cell-size)] w-auto min-w-[4rem] px-2 text-sm border border-border bg-background">
                  <span className="text-sm">{displayValue}</span>
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {options.map((option: any) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
          
          // name 기반으로 판단
          const isYear = name === "year" || name === "years"
          const isMonth = name === "month" || name === "months"
          
          // options가 없는 경우 직접 생성
          if (isYear) {
            const currentYear = new Date().getFullYear()
            const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)
            
            return (
              <Select value={value || ""} onValueChange={handleChange}>
                <SelectTrigger className="h-[var(--cell-size)] w-auto min-w-[4rem] px-2 text-sm border border-border bg-background">
                  <span className="text-sm">{value || "연도"}</span>
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
          
          if (isMonth) {
            const months = Array.from({ length: 12 }, (_, i) => {
              const date = new Date(2000, i, 1)
              return {
                value: String(i),
                label: date.toLocaleString(locale?.code || "ko", { month: "short" })
              }
            })
            
            const selectedMonth = months.find(m => m.value === String(value))
            const displayValue = selectedMonth ? selectedMonth.label : value || "월"
            
            return (
              <Select value={value || ""} onValueChange={handleChange}>
                <SelectTrigger className="h-[var(--cell-size)] w-auto min-w-[3rem] px-2 text-sm border border-border bg-background">
                  <span className="text-sm">{displayValue}</span>
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
          
          // 기본 select 요소 반환 (fallback) - name이 없거나 알 수 없는 경우
          return (
            <select
              value={value || ""}
              onChange={(e) => onChange?.(e)}
              className="h-[var(--cell-size)] px-2 text-sm border border-border rounded-md bg-background"
              {...props}
            >
              {options && Array.isArray(options) && options.map((option: any) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
                             className,
                             day,
                             modifiers,
                             locale,
                             ...props
                           }: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size={undefined}
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        `data-[selected-single=true]:bg-primary data-[selected-single=true]:text-white data-[selected-single=true]:font-bold data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-foreground relative isolate z-10 flex aspect-square size-auto w-full min-w-[var(--cell-size)] flex-col gap-1 items-center justify-center border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-[var(--cell-radius)] data-[range-end=true]:rounded-r-[var(--cell-radius)] data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-[var(--cell-radius)] data-[range-start=true]:rounded-l-[var(--cell-radius)] [&>span]:text-xs [&>span]:opacity-70 p-0 !px-0 !py-0`,
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
