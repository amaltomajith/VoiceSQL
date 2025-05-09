-- Create a function to execute SQL queries safely
-- This function will be used by the frontend to execute SQL queries

CREATE OR REPLACE FUNCTION execute_sql_query(query_string TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Execute the query and convert results to JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query_string || ') t' INTO result;
  
  -- Return empty array if null
  RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql_query TO authenticated;

-- Grant execute permission to anon users (if needed for testing)
GRANT EXECUTE ON FUNCTION execute_sql_query TO anon;
