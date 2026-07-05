// frontend/src/components/admin/events/QuestionBuilder.tsx

import { useState } from "react";
import { Plus, Trash2, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventQuestion, QuestionType } from "@/types/admin.types";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text",     label: "Short Text"      },
  { value: "textarea", label: "Long Text"        },
  { value: "radio",    label: "Single Choice"   },
  { value: "checkbox", label: "Multiple Choice" },
  { value: "select",   label: "Dropdown"        },
];

const OPTION_TYPES: QuestionType[] = ["radio", "checkbox", "select"];

const genId = () =>
  `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

interface QuestionBuilderProps {
  questions: EventQuestion[];
  onChange: (questions: EventQuestion[]) => void;
}

const QuestionBuilder = ({ questions, onChange }: QuestionBuilderProps) => {
  const [optionInputs, setOptionInputs] = useState<Record<string, string>>({});

  const addQuestion = () =>
    onChange([
      ...questions,
      // "question" matches the model field name
      { id: genId(), question: "", type: "text", required: false, options: [] },
    ]);

  const removeQuestion = (id: string) =>
    onChange(questions.filter((q) => q.id !== id));

  const update = (id: string, patch: Partial<EventQuestion>) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const move = (index: number, dir: "up" | "down") => {
    const arr = [...questions];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    onChange(arr);
  };

  const addOption = (qId: string) => {
    const val = (optionInputs[qId] ?? "").trim();
    if (!val) return;
    const q = questions.find((x) => x.id === qId);
    if (!q) return;
    const opts = q.options ?? [];
    if (!opts.includes(val)) update(qId, { options: [...opts, val] });
    setOptionInputs((p) => ({ ...p, [qId]: "" }));
  };

  const removeOption = (qId: string, opt: string) => {
    const q = questions.find((x) => x.id === qId);
    if (!q) return;
    update(qId, { options: (q.options ?? []).filter((o) => o !== opt) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Registration Questions
          {questions.length > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({questions.length})
            </span>
          )}
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-3 w-3 mr-1" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
          No questions yet. Click "Add Question" to build a registration form.
        </p>
      )}

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="border rounded-lg p-3 space-y-3 bg-background">

            {/* Row: reorder + question text + type + required + delete */}
            <div className="flex items-start gap-2">

              {/* Reorder */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, "up")}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === questions.length - 1}
                  onClick={() => move(idx, "down")}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              <span className="text-xs text-muted-foreground font-medium pt-2.5 shrink-0">
                Q{idx + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* "question" field — matches model */}
                <Input
                  value={q.question}
                  onChange={(e) => update(q.id, { question: e.target.value })}
                  placeholder="Question text"
                  className="text-sm"
                />
                <Select
                  value={q.type}
                  onValueChange={(v) =>
                    update(q.id, {
                      type: v as QuestionType,
                      options: OPTION_TYPES.includes(v as QuestionType)
                        ? q.options ?? []
                        : [],
                    })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-1.5 shrink-0">
                <Switch
                  id={`req-${q.id}`}
                  checked={q.required}
                  onCheckedChange={(v) => update(q.id, { required: v })}
                  className="scale-75 origin-right"
                />
                <Label
                  htmlFor={`req-${q.id}`}
                  className="text-xs whitespace-nowrap cursor-pointer"
                >
                  Required
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeQuestion(q.id)}
                  aria-label="Remove question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Placeholder for text/textarea */}
            {(q.type === "text" || q.type === "textarea") && (
              <Input
                value={q.placeholder ?? ""}
                onChange={(e) => update(q.id, { placeholder: e.target.value })}
                placeholder="Placeholder text (optional)"
                className="text-sm"
              />
            )}

            {/* Options for choice types */}
            {OPTION_TYPES.includes(q.type) && (
              <div className="space-y-2">
                {(q.options ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(q.options ?? []).map((opt) => (
                      <Badge
                        key={opt}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 text-xs"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, opt)}
                          className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                          aria-label={`Remove ${opt}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={optionInputs[q.id] ?? ""}
                    onChange={(e) =>
                      setOptionInputs((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption(q.id);
                      }
                    }}
                    placeholder="Add option, press Enter"
                    className="text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addOption(q.id)}
                    disabled={!(optionInputs[q.id] ?? "").trim()}
                    aria-label="Add option"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionBuilder;