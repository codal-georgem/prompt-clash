export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      scenarios: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          difficulty: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: string;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          scenario_id: string;
          employee_name: string;
          prompt_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          employee_name: string;
          prompt_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          employee_name?: string;
          prompt_text?: string;
          created_at?: string;
        };
      };
      prompt_analysis: {
        Row: {
          id: string;
          submission_id: string;
          score: number;
          category: string;
          strengths: Json;
          weaknesses: Json;
          improved_prompt: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          score: number;
          category: string;
          strengths: Json;
          weaknesses: Json;
          improved_prompt: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          score?: number;
          category?: string;
          strengths?: Json;
          weaknesses?: Json;
          improved_prompt?: string;
          created_at?: string;
        };
      };
    };
  };
};
