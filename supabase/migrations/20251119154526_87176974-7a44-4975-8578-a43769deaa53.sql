-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('scientific_director', 'values_reviewer', 'project_manager');

-- Create enum for patient status
CREATE TYPE public.patient_status AS ENUM ('pending', 'on_hold', 'approved', 'treatment_started', 'completed', 'declined');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'declined', 'modification_requested');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pdc_number TEXT NOT NULL UNIQUE,
  patient_story TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  status patient_status DEFAULT 'pending' NOT NULL,
  pdc_cost DECIMAL(10,2),
  discounted_cost DECIMAL(10,2),
  liberatoria_signed BOOLEAN DEFAULT FALSE,
  liberatoria_confirmed_at TIMESTAMPTZ,
  liberatoria_confirmed_by UUID REFERENCES public.profiles(id),
  hubspot_form_id TEXT,
  primoup_link TEXT,
  clinical_data JSONB,
  panoramica_url TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create approvals table
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_role app_role NOT NULL,
  status approval_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (patient_id, reviewer_role)
);

-- Enable RLS on approvals
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Create budget_tracking table
CREATE TABLE public.budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INTEGER NOT NULL,
  allocated_budget DECIMAL(12,2) NOT NULL,
  spent_budget DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (fiscal_year)
);

-- Enable RLS on budget_tracking
ALTER TABLE public.budget_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project managers can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for patients
CREATE POLICY "Authenticated users can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project managers can insert patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Project managers can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for approvals
CREATE POLICY "Users can view all approvals"
  ON public.approvals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reviewers can insert their own approvals"
  ON public.approvals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own approvals"
  ON public.approvals FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- RLS Policies for budget_tracking
CREATE POLICY "All users can view budget"
  ON public.budget_tracking FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project managers can manage budget"
  ON public.budget_tracking FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'project_manager'));

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_tracking_updated_at
  BEFORE UPDATE ON public.budget_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial budget for current year
INSERT INTO public.budget_tracking (fiscal_year, allocated_budget)
VALUES (EXTRACT(YEAR FROM NOW())::INTEGER, 100000.00);