CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT name_format
        CHECK (name ~ '^[A-Za-z0-9][A-Za-z0-9 \-''.,]{0,98}[A-Za-z0-9]$'),
    CONSTRAINT code_format CHECK (code ~ '^[A-Z][A-Z0-9]{0,19}$'),
    CONSTRAINT location_format 
        CHECK (location IN ('New York', 'San Francisco', 'London')),
    CONSTRAINT is_active_department_format CHECK (is_active IN (TRUE, FALSE))
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country_code VARCHAR(4) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    
    CONSTRAINT first_name_format
        CHECK (first_name ~ '^[[:alpha:]][-[:alpha:]'' ]{0,98}[[:alpha:]]$'),
    CONSTRAINT last_name_format
        CHECK (last_name ~ '^[[:alpha:]][-[:alpha:]'' ]{0,98}[[:alpha:]]$'),
    CONSTRAINT title_format
        CHECK (title ~ '^[[:alpha:]][-[:alpha:]'' ]{0,98}[[:alpha:]]$'),
    CONSTRAINT email_format
        CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT country_code_format CHECK (country_code ~ '^[0-9]{1,4}$'),
    CONSTRAINT phone_number_format CHECK (phone_number ~ '^[0-9]{7,15}$'),
    CONSTRAINT is_active_employee_format CHECK (is_active IN (TRUE, FALSE))
);

CREATE OR REPLACE FUNCTION timestamp_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION timestamp_update();

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION timestamp_update();
