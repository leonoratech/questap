'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CourseAssociation } from '@/data/models/course'
import { Program } from '@/data/models/program'
import { Subject } from '@/data/models/subject'
import { getAllPrograms } from '@/data/services/programs-service'
import { BookOpen, Calendar, GraduationCap, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface AssociationSelectorProps {
  association: CourseAssociation
  onUpdate: (updated: CourseAssociation) => void
  onRemove: () => void
  disabled?: boolean
}

export function AssociationSelector({
  association,
  onUpdate,
  onRemove,
  disabled = false
}: AssociationSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  
  // Load colleges on mount
  useEffect(() => {
    loadPrograms()
  }, [])
  
  const loadPrograms = async () => {
    try {
      setLoading(true)
      const fetchedPrograms = await getAllPrograms()
      setPrograms(fetchedPrograms)
      
      // Clear program and subject if the current selection is not in the new list
      if (association.programId && !fetchedPrograms.find(p => p.id === association.programId)) {
        onUpdate({
          ...association,
          programId: '',
          programName: '',
          subjectId: '',
          subjectName: ''
        })
      }
    } catch (error) {
      console.error('Error loading programs:', error)
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const handleProgramChange = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    setSubjects(program?.subjects || [])

    onUpdate({
      ...association,
      programId,
      programName: program?.name || '',
      subjectId: '',
      subjectName: ''
    })
  }

  const handleYearChange = (yearOrSemester: string) => {
    onUpdate({
      ...association,
      yearOrSemester: parseInt(yearOrSemester)
    })
  }

  const handleSubjectChange = (subjectId: string) => {
    const subject = programs
      .flatMap(p => p.subjects || [])
      .find(s => s.id === subjectId)
    
    onUpdate({
      ...association,
      subjectId,
      subjectName: subject?.name || ''
    })
  }

  const getYearOptions = () => {
    const selectedProgram = programs.find(p => p.id === association.programId)
    if (!selectedProgram) return []
    
    const options = []
    for (let i = 1; i <= selectedProgram.yearsOrSemesters; i++) {
      options.push({
        value: i.toString(),
        label: `${selectedProgram.semesterType === 'years' ? 'Year' : 'Semester'} ${i}`
      })
    }
    return options
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Program Association</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Program Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Program *
          </Label>
          <Select
            value={association.programId}
            onValueChange={handleProgramChange}
            disabled={disabled || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id || ''}>
                  <div className="flex flex-col">
                    <span>{program.name}</span>
                    {/* <span className="text-xs text-muted-foreground">
                      {program.yearsOrSemesters} {program.semesterType}
                    </span> */}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year/Semester Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Year/Semester *
          </Label>
          <Select
            value={association.yearOrSemester.toString()}
            onValueChange={handleYearChange}
            disabled={disabled || loading || !association.programId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year/semester" />
            </SelectTrigger>
            <SelectContent>
              {getYearOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subject *
          </Label>
          <Select
            value={association.subjectId}
            onValueChange={handleSubjectChange}
            disabled={disabled || loading || !association.programId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id!}>
                  <div className="flex flex-col">
                    <span>{subject.name}</span>        
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Message */}
      {(!association.programId || !association.subjectId) && (
        <div className="text-xs text-muted-foreground">
          Please select all required fields to complete this association.
        </div>
      )}
    </div>
  )
}
