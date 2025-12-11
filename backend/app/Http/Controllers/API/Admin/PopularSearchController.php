<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\PopularSearch;
use Illuminate\Http\Request;

class PopularSearchController extends Controller
{
    public function index()
    {
        $searches = PopularSearch::orderBy('count', 'desc')->paginate(20);
        return response()->json($searches);
    }

    public function store(Request $request)
    {
        $request->validate([
            'query' => 'required|string|unique:popular_searches,query',
            'count' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $search = PopularSearch::create($request->all());
        return response()->json($search, 201);
    }

    public function update(Request $request, $id)
    {
        $search = PopularSearch::findOrFail($id);

        $request->validate([
            'query' => 'string|unique:popular_searches,query,' . $id,
            'count' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $search->update($request->all());
        return response()->json($search);
    }

    public function destroy($id)
    {
        $search = PopularSearch::findOrFail($id);
        $search->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
